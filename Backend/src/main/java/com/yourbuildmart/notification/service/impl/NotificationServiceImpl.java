package com.yourbuildmart.notification.service.impl;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.notification.dto.response.NotificationResponse;
import com.yourbuildmart.notification.entity.Notification;
import com.yourbuildmart.notification.repository.NotificationRepository;
import com.yourbuildmart.notification.service.NotificationService;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(String email, Pageable pageable) {
        User user = getUser(email);
        return PageResponse.from(
                notificationRepository.findByUser(user, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(String email) {
        User user = getUser(email);
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long notificationId) {
        User         user         = getUser(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Notification does not belong to current user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = getUser(email);
        notificationRepository.findByUser(user, Pageable.unpaged())
                .forEach(n -> {
                    if (!n.isRead()) {
                        n.setRead(true);
                        notificationRepository.save(n);
                    }
                });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .actionUrl(n.getActionUrl())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
