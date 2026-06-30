package com.yourbuildmart.admin.service.impl;

import com.yourbuildmart.admin.dto.AdminDashboardResponse;
import com.yourbuildmart.admin.dto.AdminDashboardResponse.CategoryStat;
import com.yourbuildmart.admin.dto.AdminDashboardResponse.TopProduct;
import com.yourbuildmart.admin.service.AdminService;
import com.yourbuildmart.brand.repository.BrandRepository;
import com.yourbuildmart.category.repository.CategoryRepository;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.order.entity.Order;
import com.yourbuildmart.order.repository.OrderRepository;
import com.yourbuildmart.order.service.OrderService;
import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import com.yourbuildmart.product.service.ProductService;
import com.yourbuildmart.auth.repository.RefreshTokenRepository;
import com.yourbuildmart.email.EmailService;
import com.yourbuildmart.email.dto.EmailRequest;
import com.yourbuildmart.email.enums.EmailType;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.user.dto.response.UserResponse;
import com.yourbuildmart.user.entity.Role;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import com.yourbuildmart.user.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository         userRepository;
    private final ProductRepository      productRepository;
    private final OrderRepository        orderRepository;
    private final CategoryRepository     categoryRepository;
    private final BrandRepository        brandRepository;
    private final OrderService           orderService;
    private final ProductService         productService;
    private final UserServiceImpl        userServiceImpl;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService           emailService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        log.info("[ADMIN] ▶ getDashboardStats()");

        // Category-wise stats
        List<Object[]> rawCatStats = productRepository.findCategoryStats();
        List<CategoryStat> categoryStats = rawCatStats.stream()
            .map(row -> CategoryStat.builder()
                .name(row[0] != null ? row[0].toString() : "Unknown")
                .productCount(((Number) row[1]).longValue())
                .totalStock(((Number) row[2]).longValue())
                .build())
            .collect(Collectors.toList());

        // Top 12 products
        Pageable top12 = PageRequest.of(0, 12, Sort.by("createdAt").descending());
        List<Product> topProds = productRepository.findTop12ByActiveTrueOrderByCreatedAtDesc(top12);
        List<TopProduct> topProducts = topProds.stream()
            .map(p -> TopProduct.builder()
                .id(p.getId())
                .name(p.getName())
                .imageUrl(p.getImageUrl())
                .price(p.getPrice() != null ? p.getPrice().doubleValue() : 0)
                .averageRating(p.getAverageRating() != null ? p.getAverageRating() : 0)
                .reviewCount(p.getReviewCount() != null ? p.getReviewCount() : 0)
                .slug(null)
                .category(p.getCategory() != null ? p.getCategory().getName() : null)
                .build())
            .collect(Collectors.toList());

        // Product source counts
        long sellerProducts = productRepository.countBySellerIsNotNull();
        long adminProducts  = productRepository.countBySellerIsNull();
        long published      = productRepository.countByActiveTrue();

        AdminDashboardResponse stats = AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalProducts(published)
                .totalOrders(orderRepository.count())
                .totalCategories(categoryRepository.count())
                .totalBrands(brandRepository.count())
                .pendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING))
                .totalRevenue(0.0)
                .categoryStats(categoryStats)
                .topProducts(topProducts)
                .publishedProducts(published)
                .adminProducts(adminProducts)
                .sellerProducts(sellerProducts)
                .build();

        log.info("[ADMIN] ✅ Dashboard stats loaded — categories={}, topProducts={}",
                categoryStats.size(), topProducts.size());
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        return PageResponse.from(
                userRepository.findAll(pageable).map(userServiceImpl::toResponse));
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Prevent disabling the last active admin
        if (user.getRole() == Role.ADMIN && user.isActive()) {
            long activeAdmins = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot disable the last active admin account.");
            }
        }

        user.setActive(!user.isActive());
        userRepository.save(user);
        log.info("[ADMIN] 🔄 User status toggled — id={}, active={}", userId, user.isActive());

        // If disabling — kill existing session immediately + send notification email
        if (!user.isActive()) {
            refreshTokenRepository.deleteByUser(user);
            emailService.sendEmail(EmailRequest.builder()
                    .to(user.getEmail())
                    .userName(user.getFirstName())
                    .userEmail(user.getEmail())
                    .emailType(EmailType.ACCOUNT_DISABLED)
                    .build());
        }
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Prevent deleting the last admin
        if (user.getRole() == Role.ADMIN) {
            long totalAdmins = userRepository.countByRole(Role.ADMIN);
            if (totalAdmins <= 1) {
                throw new BadRequestException("Cannot delete the last admin account.");
            }
        }

        // Notify user before their account is deleted (email first, then delete)
        emailService.sendEmail(EmailRequest.builder()
                .to(user.getEmail())
                .userName(user.getFirstName())
                .emailType(EmailType.ACCOUNT_DELETED)
                .build());

        // Delete refresh token first to avoid FK constraint violation
        refreshTokenRepository.deleteByUser(user);

        userRepository.delete(user);
        log.info("[ADMIN] 🗑️ User deleted — id={}, email={}", userId, user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public Object getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Object getAllProducts(Pageable pageable) {
        return productService.getAll(pageable);
    }
}
