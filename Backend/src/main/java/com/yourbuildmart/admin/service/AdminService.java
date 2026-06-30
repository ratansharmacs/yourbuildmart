package com.yourbuildmart.admin.service;

import com.yourbuildmart.admin.dto.AdminDashboardResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.user.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    void toggleUserStatus(Long userId);
    void deleteUser(Long userId);
    Object getAllOrders(Pageable pageable);
    Object getAllProducts(Pageable pageable);
}
