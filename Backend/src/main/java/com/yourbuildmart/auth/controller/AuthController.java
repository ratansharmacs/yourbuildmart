package com.yourbuildmart.auth.controller;

import com.yourbuildmart.auth.dto.request.LoginRequest;
import com.yourbuildmart.auth.dto.request.RefreshTokenRequest;
import com.yourbuildmart.auth.dto.request.RegisterRequest;
import com.yourbuildmart.auth.dto.response.AuthResponse;
import com.yourbuildmart.auth.service.AuthService;
import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public authentication endpoints.
 * Base path: /auth
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, token refresh and logout")
public class AuthController {

    private final AuthService    authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse auth = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", auth));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", auth));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Obtain a new access token using a refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse auth = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", auth));
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate the current refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails) {

        authService.logout(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check if an email address is already registered")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmail(
            @RequestParam String email) {

        boolean exists = userRepository.existsByEmail(email.trim().toLowerCase());
        return ResponseEntity.ok(ApiResponse.success("Email check", Map.of("exists", exists)));
    }
}
