package com.yourbuildmart.review.service;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.review.dto.request.ReviewRequest;
import com.yourbuildmart.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse create(String email, ReviewRequest request);
    PageResponse<ReviewResponse> getByProduct(Long productId, Pageable pageable);
    void delete(String email, Long reviewId);
    // Admin
    ReviewResponse approve(Long reviewId);
}
