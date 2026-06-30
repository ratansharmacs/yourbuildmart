package com.yourbuildmart.notification.service;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.notification.dto.response.NotificationResponse;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    PageResponse<NotificationResponse> getMyNotifications(String email, Pageable pageable);
    long countUnread(String email);
    void markAsRead(String email, Long notificationId);
    void markAllAsRead(String email);
}
