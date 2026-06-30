package com.yourbuildmart.user.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.user.dto.request.ChangePasswordRequest;
import com.yourbuildmart.user.dto.request.UpdateProfileRequest;
import com.yourbuildmart.user.dto.response.UserResponse;
import com.yourbuildmart.user.service.UserService;
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
@RequestMapping("/users/me")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Profile", description = "Current user profile and account settings")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(ApiResponse.success("Profile retrieved",
                userService.getProfile(user.getUsername())));
    }

    @PutMapping
    @Operation(summary = "Update the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userService.updateProfile(user.getUsername(), request)));
    }

    @PatchMapping("/change-password")
    @Operation(summary = "Change the current user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(user.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
