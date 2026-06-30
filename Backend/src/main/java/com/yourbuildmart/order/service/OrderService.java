package com.yourbuildmart.order.service;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.order.dto.request.AdminUpdateOrderRequest;
import com.yourbuildmart.order.dto.request.PlaceOrderRequest;
import com.yourbuildmart.order.dto.response.OrderResponse;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse placeOrder(String email, PlaceOrderRequest request);
    OrderResponse getById(String email, Long orderId);
    PageResponse<OrderResponse> getMyOrders(String email, Pageable pageable);
    OrderResponse cancelOrder(String email, Long orderId);
    // Admin
    PageResponse<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse updateStatus(Long orderId, String status);
    OrderResponse adminUpdateOrder(Long orderId, AdminUpdateOrderRequest request);
    void adminDeleteOrder(Long orderId);
}
