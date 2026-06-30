package com.yourbuildmart.review.service.impl;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.product.repository.ProductRepository;
import com.yourbuildmart.product.service.ProductService;
import com.yourbuildmart.review.dto.request.ReviewRequest;
import com.yourbuildmart.review.dto.response.ReviewResponse;
import com.yourbuildmart.review.entity.Review;
import com.yourbuildmart.review.repository.ReviewRepository;
import com.yourbuildmart.review.service.ReviewService;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository  reviewRepository;
    private final UserRepository    userRepository;
    private final ProductRepository productRepository;
    private final ProductService    productService;

    @Override
    @Transactional
    public ReviewResponse create(String email, ReviewRequest request) {
        User user = getUser(email);

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), request.getProductId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        var product = productRepository.findByIdAndActiveTrue(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false) // requires admin approval
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getByProduct(Long productId, Pageable pageable) {
        return PageResponse.from(
                reviewRepository.findByProductIdAndApprovedTrue(productId, pageable)
                        .map(this::toResponse));
    }

    @Override
    @Transactional
    public void delete(String email, Long reviewId) {
        User   user   = getUser(email);
        Review review = findOrThrow(reviewId);
        // Allow deletion by owner or admin (admin check done at controller level)
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Review does not belong to current user");
        }
        reviewRepository.delete(review);
        productService.updateRating(review.getProduct().getId());
    }

    @Override
    @Transactional
    public ReviewResponse approve(Long reviewId) {
        Review review = findOrThrow(reviewId);
        review.setApproved(true);
        Review saved = reviewRepository.save(review);
        productService.updateRating(saved.getProduct().getId());
        return toResponse(saved);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Review findOrThrow(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .reviewerName(r.getUser().getFullName())
                .rating(r.getRating())
                .comment(r.getComment())
                .approved(r.isApproved())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
