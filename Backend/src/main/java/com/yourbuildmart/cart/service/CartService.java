package com.yourbuildmart.cart.service;

import com.yourbuildmart.cart.dto.request.AddToCartRequest;
import com.yourbuildmart.cart.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String email);
    CartResponse addItem(String email, AddToCartRequest request);
    CartResponse updateItem(String email, Long cartItemId, int quantity);
    CartResponse removeItem(String email, Long cartItemId);
    void clearCart(String email);
}
