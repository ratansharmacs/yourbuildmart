package com.yourbuildmart.order.service.impl;

import com.yourbuildmart.cart.entity.Cart;
import com.yourbuildmart.cart.repository.CartRepository;
import com.yourbuildmart.cart.service.CartService;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.notification.entity.Notification;
import com.yourbuildmart.notification.repository.NotificationRepository;
import com.yourbuildmart.order.dto.request.AdminUpdateOrderRequest;
import com.yourbuildmart.order.dto.request.PlaceOrderRequest;
import com.yourbuildmart.order.dto.response.OrderItemResponse;
import com.yourbuildmart.order.dto.response.OrderResponse;
import com.yourbuildmart.order.entity.Order;
import com.yourbuildmart.order.entity.OrderItem;
import com.yourbuildmart.order.repository.OrderRepository;
import com.yourbuildmart.order.service.OrderService;
import com.yourbuildmart.email.EmailService;
import com.yourbuildmart.email.dto.EmailRequest;
import com.yourbuildmart.email.enums.EmailType;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository        orderRepository;
    private final UserRepository         userRepository;
    private final CartRepository         cartRepository;
    private final CartService            cartService;
    private final NotificationRepository notificationRepository;
    private final EmailService           emailService;

    @Override
    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest request) {
        log.info("[ORDER] ▶ placeOrder() — user={}", email);
        User user = getUser(email);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));
        if (cart.getItems().isEmpty()) throw new BadRequestException("Your cart is empty");

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            BigDecimal price = cartItem.getProduct().getPrice();
            return OrderItem.builder()
                    .product(cartItem.getProduct())
                    .productName(cartItem.getProduct().getName())
                    .quantity(cartItem.getQuantity())
                    .price(price)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = orderItems.stream()
                .map(i -> (i.getPrice() != null ? i.getPrice() : BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String enquiryCode = generateEnquiryCode();
        Order order = Order.builder()
                .orderNumber(enquiryCode)
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.UN_PAID)
                .enquiryName(request.getName())
                .enquiryEmail(request.getEmail())
                .enquiryOrganization(request.getOrganization())
                .enquiryCountry(request.getCountry())
                .enquiryPhone(request.getPhone())
                .enquiryText(request.getEnquiry())
                .totalAmount(total)
                .build();

        orderItems.forEach(item -> { item.setOrder(order); order.getItems().add(item); });
        Order saved = orderRepository.save(order);
        log.info("[ORDER] ✅ saved — id={}, code={}", saved.getId(), saved.getOrderNumber());

        try { cartService.clearCart(email); } catch (Exception e) { log.warn("[ORDER] cart clear failed: {}", e.getMessage()); }
        try {
            notificationRepository.save(Notification.builder()
                    .user(user).title("Enquiry Submitted!")
                    .message("Your enquiry " + saved.getOrderNumber() + " has been received.")
                    .type(Notification.NotificationType.ORDER_PLACED)
                    .actionUrl("/orders/" + saved.getId()).build());
        } catch (Exception e) { log.warn("[ORDER] notification failed: {}", e.getMessage()); }

        // ── Build items summary for email ─────────────────────────────────
        String recipientEmail = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail() : email;
        String itemsSummary = saved.getItems().stream()
                .map(i -> "<tr><td style=\"padding:8px 10px;border:1px solid #e0e0e0;\">"
                        + i.getProductName() + "</td><td style=\"padding:8px 10px;border:1px solid #e0e0e0;\">"
                        + i.getQuantity() + "</td></tr>")
                .collect(Collectors.joining());

        // ── Email to user ─────────────────────────────────────────────────
        try {
            emailService.sendEmail(EmailRequest.builder()
                    .to(recipientEmail)
                    .userName(request.getName() != null ? request.getName() : user.getFirstName())
                    .userEmail(email)
                    .orderNumber(saved.getOrderNumber())
                    .orderItemsSummary(itemsSummary)
                    .enquiryOrganization(request.getOrganization())
                    .emailType(EmailType.ENQUIRY_CONFIRMATION)
                    .build());
        } catch (Exception e) { log.warn("[ORDER] enquiry confirmation email failed: {}", e.getMessage()); }

        // ── Email to admin ────────────────────────────────────────────────
        try {
            emailService.sendEmail(EmailRequest.builder()
                    .to("info@yourbuildmart.com")
                    .userName(request.getName() != null ? request.getName() : user.getFirstName())
                    .userEmail(email)
                    .orderNumber(saved.getOrderNumber())
                    .orderItemsSummary(itemsSummary)
                    .enquiryOrganization(request.getOrganization())
                    .emailType(EmailType.ADMIN_NEW_ENQUIRY_ALERT)
                    .build());
        } catch (Exception e) { log.warn("[ORDER] admin enquiry alert email failed: {}", e.getMessage()); }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(String email, Long orderId) {
        User user = getUser(email);
        Order order = findOrThrow(orderId);
        if (!order.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Order does not belong to current user");
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable) {
        User user = getUser(email);
        return PageResponse.from(orderRepository.findByUser(user, pageable).map(this::toResponse));
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String email, Long orderId) {
        User user = getUser(email);
        Order order = findOrThrow(orderId);
        if (!order.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Order does not belong to current user");
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED)
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        order.setStatus(Order.OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        return PageResponse.from(orderRepository.findAll(pageable).map(this::toResponse));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        Order order = findOrThrow(orderId);
        try { order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase())); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid order status: " + status); }
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse adminUpdateOrder(Long orderId, AdminUpdateOrderRequest req) {
        Order order = findOrThrow(orderId);

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try { order.setStatus(Order.OrderStatus.valueOf(req.getStatus().toUpperCase())); }
            catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + req.getStatus()); }
        }
        if (req.getPaymentStatus() != null && !req.getPaymentStatus().isBlank()) {
            try { order.setPaymentStatus(Order.PaymentStatus.valueOf(
                    req.getPaymentStatus().toUpperCase().replace("-", "_"))); }
            catch (IllegalArgumentException e) { throw new BadRequestException("Invalid payment status: " + req.getPaymentStatus()); }
        }
        if (req.getDeliveryPartner() != null) order.setDeliveryPartner(req.getDeliveryPartner());
        if (req.getTrackingId()      != null) order.setTrackingId(req.getTrackingId());
        if (req.getTrackingUrl()     != null) order.setTrackingUrl(req.getTrackingUrl());

        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void adminDeleteOrder(Long orderId) {
        orderRepository.delete(findOrThrow(orderId));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Order findOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    private String generateEnquiryCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String rand = String.format("%08d", new Random().nextInt(100_000_000));
        return date + "-" + rand;
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream().map(i -> {
            String img = i.getProduct().getImageUrl();
            if (img == null || img.isBlank()) {
                List<String> extras = i.getProduct().getAdditionalImages();
                if (extras != null && !extras.isEmpty()) img = extras.get(0);
            }
            BigDecimal price = i.getPrice() != null ? i.getPrice() : i.getProduct().getPrice();
            BigDecimal qty   = BigDecimal.valueOf(i.getQuantity() != null ? i.getQuantity() : 1);
            BigDecimal total = price != null ? price.multiply(qty) : BigDecimal.ZERO;
            return OrderItemResponse.builder()
                    .productId(i.getProduct().getId())
                    .productName(i.getProductName())
                    .imageUrl(img)
                    .quantity(i.getQuantity())
                    .price(price)
                    .total(total)
                    .build();
        }).collect(Collectors.toList());

        User u = o.getUser();
        String custName = u != null
                ? (u.getFirstName() != null ? u.getFirstName() + (u.getLastName() != null ? " " + u.getLastName() : "") : u.getEmail()).trim()
                : null;

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus().name())
                .paymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "UN_PAID")
                .deliveryPartner(o.getDeliveryPartner())
                .trackingId(o.getTrackingId())
                .trackingUrl(o.getTrackingUrl())
                .totalAmount(o.getTotalAmount())
                .customerName(custName)
                .customerEmail(u != null ? u.getEmail() : null)
                .enquiryName(o.getEnquiryName())
                .enquiryEmail(o.getEnquiryEmail())
                .enquiryOrganization(o.getEnquiryOrganization())
                .enquiryCountry(o.getEnquiryCountry())
                .enquiryPhone(o.getEnquiryPhone())
                .enquiryText(o.getEnquiryText())
                .items(items)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
