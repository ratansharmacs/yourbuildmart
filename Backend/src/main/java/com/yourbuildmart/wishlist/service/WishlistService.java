package com.yourbuildmart.wishlist.service;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.wishlist.dto.response.WishlistResponse;
import org.springframework.data.domain.Pageable;

public interface WishlistService {
    WishlistResponse toggle(String email, Long productId);
    PageResponse<WishlistResponse> getMyWishlist(String email, Pageable pageable);
    boolean isWishlisted(String email, Long productId);
}
