package com.yourbuildmart.cart.service.impl;

import com.yourbuildmart.cart.dto.request.AddToCartRequest;
import com.yourbuildmart.cart.dto.response.CartItemResponse;
import com.yourbuildmart.cart.dto.response.CartResponse;
import com.yourbuildmart.cart.entity.Cart;
import com.yourbuildmart.cart.entity.CartItem;
import com.yourbuildmart.cart.repository.CartItemRepository;
import com.yourbuildmart.cart.repository.CartRepository;
import com.yourbuildmart.cart.service.CartService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository     cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        log.info("[CART] ▶ getCart() — user={}", email);
        User user = getUser(email);
        Cart cart = cartRepository.findByUser(user).orElse(Cart.builder().user(user).build());
        CartResponse response = toResponse(cart);
        log.info("[CART] ✅ Cart fetched — user={}, items={}", email, response.getTotalItems());
        return response;
    }

    @Override
    @Transactional
    public CartResponse addItem(String email, AddToCartRequest request) {
        log.info("[CART] ▶ addItem() — user={}, productId={}, qty={}",
                email, request.getProductId(), request.getQuantity());

        User    user    = getUser(email);
        Product product = getProduct(request.getProductId());

        if (product.getStock() < request.getQuantity()) {
            log.warn("[CART] ✖ Insufficient stock — productId={}, available={}, requested={}",
                    product.getId(), product.getStock(), request.getQuantity());
            throw new BadRequestException("Insufficient stock. Available: " + product.getStock());
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    log.debug("[CART]   Creating new cart for user={}", email);
                    return cartRepository.save(Cart.builder().user(user).build());
                });

        cartItemRepository.findByCartAndProduct(cart, product).ifPresentOrElse(
                item -> {
                    int newQty = item.getQuantity() + request.getQuantity();
                    log.debug("[CART]   Updating existing item — productId={}, qty {} → {}",
                            product.getId(), item.getQuantity(), newQty);
                    item.setQuantity(newQty);
                    cartItemRepository.save(item);
                },
                () -> {
                    log.debug("[CART]   Adding new item — productId={}, qty={}",
                            product.getId(), request.getQuantity());
                    CartItem item = CartItem.builder()
                            .cart(cart).product(product).quantity(request.getQuantity()).build();
                    cart.getItems().add(cartItemRepository.save(item));
                }
        );

        CartResponse response = toResponse(cartRepository.save(cart));
        log.info("[CART] ✅ Item added — user={}, productId={}, totalItems={}",
                email, request.getProductId(), response.getTotalItems());
        return response;
    }

    @Override
    @Transactional
    public CartResponse updateItem(String email, Long cartItemId, int quantity) {
        log.info("[CART] ▶ updateItem() — user={}, cartItemId={}, newQty={}", email, cartItemId, quantity);

        User     user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> {
                    log.warn("[CART] ✖ CartItem not found — id={}", cartItemId);
                    return new ResourceNotFoundException("CartItem", "id", cartItemId);
                });

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            log.warn("[CART] ✖ CartItem {} does not belong to user={}", cartItemId, email);
            throw new BadRequestException("Item does not belong to your cart");
        }

        if (quantity <= 0) {
            log.debug("[CART]   Removing item (qty<=0) — cartItemId={}", cartItemId);
            Cart cart = item.getCart();
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            CartResponse response = toResponse(cartRepository.save(cart));
            log.info("[CART] ✅ Item removed — user={}, cartItemId={}", email, cartItemId);
            return response;
        }

        if (item.getProduct().getStock() < quantity) {
            log.warn("[CART] ✖ Stock check failed — productId={}, available={}, requested={}",
                    item.getProduct().getId(), item.getProduct().getStock(), quantity);
            throw new BadRequestException("Insufficient stock. Available: " + item.getProduct().getStock());
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        CartResponse response = toResponse(item.getCart());
        log.info("[CART] ✅ Item updated — user={}, cartItemId={}, newQty={}", email, cartItemId, quantity);
        return response;
    }

    @Override
    @Transactional
    public CartResponse removeItem(String email, Long cartItemId) {
        log.info("[CART] ▶ removeItem() — user={}, cartItemId={}", email, cartItemId);

        User     user = getUser(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> {
                    log.warn("[CART] ✖ CartItem not found — id={}", cartItemId);
                    return new ResourceNotFoundException("CartItem", "id", cartItemId);
                });

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            log.warn("[CART] ✖ CartItem {} does not belong to user={}", cartItemId, email);
            throw new BadRequestException("Item does not belong to your cart");
        }

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        CartResponse response = toResponse(cartRepository.save(cart));
        log.info("[CART] ✅ Item removed — user={}, cartItemId={}", email, cartItemId);
        return response;
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        log.info("[CART] ▶ clearCart() — user={}", email);
        User user = getUser(email);
        cartRepository.findByUser(user).ifPresent(cart -> {
            int itemCount = cart.getItems().size();
            cartItemRepository.deleteByCart(cart);
            cart.getItems().clear();
            cartRepository.save(cart);
            log.info("[CART] ✅ Cart cleared — user={}, removedItems={}", email, itemCount);
        });
        if (cartRepository.findByUser(user).map(c -> c.getItems().isEmpty()).orElse(true)) {
            log.debug("[CART]   No cart found to clear for user={}", email);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("[CART] ✖ User not found — email={}", email);
                    return new UsernameNotFoundException("User not found: " + email);
                });
    }

    private Product getProduct(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> {
                    log.warn("[CART] ✖ Product not found or inactive — id={}", id);
                    return new ResourceNotFoundException("Product", "id", id);
                });
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> {
                    String img = i.getProduct().getImageUrl();
                    if (img == null || img.isBlank()) {
                        List<String> extras = i.getProduct().getAdditionalImages();
                        if (extras != null && !extras.isEmpty()) img = extras.get(0);
                    }
                    BigDecimal unitPrice = i.getProduct().getPrice();
                    return CartItemResponse.builder()
                            .cartItemId(i.getId())
                            .productId(i.getProduct().getId())
                            .productName(i.getProduct().getName())
                            .imageUrl(img)
                            .quantity(i.getQuantity())
                            .unitPrice(unitPrice)
                            .totalPrice(unitPrice != null
                                    ? unitPrice.multiply(BigDecimal.valueOf(i.getQuantity()))
                                    : null)
                            .build();
                }).collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(i -> i.getTotalPrice() != null ? i.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalItems(items.stream().mapToInt(CartItemResponse::getQuantity).sum())
                .subtotal(subtotal)
                .build();
    }
}
