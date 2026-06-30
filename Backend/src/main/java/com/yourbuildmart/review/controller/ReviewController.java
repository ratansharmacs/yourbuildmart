package com.yourbuildmart.review.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.review.dto.request.ReviewRequest;
import com.yourbuildmart.review.dto.response.ReviewResponse;
import com.yourbuildmart.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product review management")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all approved reviews for a product")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved",
                reviewService.getByProduct(productId,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Submit a product review (requires login)")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted and pending approval",
                        reviewService.create(user.getUsername(), request)));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete your own review")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {

        reviewService.delete(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Approve a review (Admin)")
    public ResponseEntity<ApiResponse<ReviewResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Review approved",
                reviewService.approve(id)));
    }
}
