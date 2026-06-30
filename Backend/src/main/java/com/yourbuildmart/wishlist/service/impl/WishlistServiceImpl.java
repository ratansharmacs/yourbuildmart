package com.yourbuildmart.wishlist.service.impl;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import com.yourbuildmart.wishlist.dto.response.WishlistResponse;
import com.yourbuildmart.wishlist.entity.Wishlist;
import com.yourbuildmart.wishlist.repository.WishlistRepository;
import com.yourbuildmart.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository     userRepository;
    private final ProductRepository  productRepository;

    @Override
    @Transactional
    public WishlistResponse toggle(String email, Long productId) {
        User    user    = getUser(email);
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (wishlistRepository.existsByUserAndProductId(user, productId)) {
            wishlistRepository.deleteByUserAndProductId(user, productId);
            return WishlistResponse.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .wishlisted(false)
                    .build();
        }

        Wishlist saved = wishlistRepository.save(
                Wishlist.builder().user(user).product(product).build());

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WishlistResponse> getMyWishlist(String email, Pageable pageable) {
        User user = getUser(email);
        // Only return items where the product is still active
        return PageResponse.from(
            wishlistRepository.findByUserAndProductActive(user, pageable)
                              .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(String email, Long productId) {
        User user = getUser(email);
        return wishlistRepository.existsByUserAndProductId(user, productId);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private WishlistResponse toResponse(Wishlist w) {
        Product p = w.getProduct();

        // Resolve best available image: primary first, then first gallery image
        String image = p.getImageUrl();
        if ((image == null || image.isBlank()) &&
            p.getAdditionalImages() != null && !p.getAdditionalImages().isEmpty()) {
            image = p.getAdditionalImages().get(0);
        }

        return WishlistResponse.builder()
                .id(w.getId())
                .productId(p.getId())
                .productName(p.getName())
                .imageUrl(image)
                .price(p.getPrice())
                .addedAt(w.getCreatedAt())
                .wishlisted(true)
                .build();
    }
}
