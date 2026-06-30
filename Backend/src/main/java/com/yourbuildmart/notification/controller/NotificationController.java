package com.yourbuildmart.notification.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.notification.dto.response.NotificationResponse;
import com.yourbuildmart.notification.service.NotificationService;
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
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notifications", description = "User notification inbox")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get paginated notifications for the current user")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getAll(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved",
                notificationService.getMyNotifications(user.getUsername(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count unread notifications")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(ApiResponse.success("Unread count",
                notificationService.countUnread(user.getUsername())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {

        notificationService.markAsRead(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails user) {

        notificationService.markAllAsRead(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
