package com.yourbuildmart.wishlist.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.wishlist.dto.response.WishlistResponse;
import com.yourbuildmart.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Wishlist", description = "Save favourite products for later")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get all items in the current user's wishlist")
    public ResponseEntity<ApiResponse<PageResponse<WishlistResponse>>> getMyWishlist(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved",
                wishlistService.getMyWishlist(user.getUsername(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PostMapping("/toggle/{productId}")
    @Operation(summary = "Add product to wishlist (or remove if already wishlisted)")
    public ResponseEntity<ApiResponse<WishlistResponse>> toggle(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId) {

        WishlistResponse result = wishlistService.toggle(user.getUsername(), productId);
        boolean isNowWishlisted = Boolean.TRUE.equals(result.getWishlisted());
        return ResponseEntity.ok(ApiResponse.success(
                isNowWishlisted ? "Added to wishlist" : "Removed from wishlist",
                result));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if a product is in the current user's wishlist")
    public ResponseEntity<ApiResponse<Boolean>> check(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId) {

        return ResponseEntity.ok(ApiResponse.success("Wishlist check",
                wishlistService.isWishlisted(user.getUsername(), productId)));
    }
}
