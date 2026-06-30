package com.yourbuildmart.cart.controller;

import com.yourbuildmart.cart.dto.request.AddToCartRequest;
import com.yourbuildmart.cart.dto.response.CartResponse;
import com.yourbuildmart.cart.service.CartService;
import com.yourbuildmart.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "View current user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved",
                cartService.getCart(user.getUsername())));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item added to cart",
                cartService.addItem(user.getUsername(), request)));
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Update quantity of a cart item (0 = remove)")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.success("Cart item updated",
                cartService.updateItem(user.getUsername(), cartItemId, quantity)));
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove a specific item from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(ApiResponse.success("Item removed",
                cartService.removeItem(user.getUsername(), cartItemId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear the entire cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
