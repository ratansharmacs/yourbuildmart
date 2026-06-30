package com.yourbuildmart.order.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.order.dto.request.AdminUpdateOrderRequest;
import com.yourbuildmart.order.dto.request.PlaceOrderRequest;
import com.yourbuildmart.order.dto.response.OrderResponse;
import com.yourbuildmart.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Orders", description = "Enquiry placement and tracking")
public class OrderController {

    private final OrderService orderService;

    // ── User Endpoints ───────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Submit an enquiry from the current cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse response = orderService.placeOrder(user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Enquiry submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get enquiry history for the current user")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OrderResponse> result = orderService.getMyOrders(
                user.getUsername(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Enquiries retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single enquiry by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        OrderResponse response = orderService.getById(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Enquiry retrieved", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending enquiry")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Enquiry cancelled", response));
    }

    // ── Admin Endpoints ──────────────────────────────────────────────────────

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update delivery status (Admin only)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderResponse response = orderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    @PutMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: full update of order fields (delivery partner, payment status, tracking)")
    public ResponseEntity<ApiResponse<OrderResponse>> adminUpdate(
            @PathVariable Long id,
            @RequestBody AdminUpdateOrderRequest request) {
        OrderResponse response = orderService.adminUpdateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order updated", response));
    }

    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: delete an order")
    public ResponseEntity<ApiResponse<Void>> adminDelete(@PathVariable Long id) {
        orderService.adminDeleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted", null));
    }
}
