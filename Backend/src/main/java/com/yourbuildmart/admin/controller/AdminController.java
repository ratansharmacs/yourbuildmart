package com.yourbuildmart.admin.controller;

import com.yourbuildmart.admin.dto.AdminDashboardResponse;
import com.yourbuildmart.admin.service.AdminService;
import com.yourbuildmart.auth.dto.request.LoginRequest;
import com.yourbuildmart.auth.dto.response.AuthResponse;
import com.yourbuildmart.auth.service.AuthService;
import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.user.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-specific routes.
 * /admin/login  – public
 * /admin/**     – ADMIN role required
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Panel", description = "Admin authentication and management endpoints")
public class AdminController {

    private final AuthService  authService;
    private final AdminService adminService;

    // ─── Public login ─────────────────────────────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "Admin login – returns JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Admin login successful", auth));
    }

    // ─── Protected routes (ADMIN only) ───────────────────────────────────────

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Admin dashboard – key statistics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard data loaded", adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "List all users (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved", adminService.getAllUsers(pr)));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Permanently delete a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "List all orders (paginated)")
    public ResponseEntity<ApiResponse<?>> listOrders(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Orders retrieved", adminService.getAllOrders(pr)));
    }

    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "List all products (paginated)")
    public ResponseEntity<ApiResponse<?>> listProducts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Products retrieved", adminService.getAllProducts(pr)));
    }
}
