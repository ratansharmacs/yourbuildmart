package com.yourbuildmart.notification.dto.response;
import lombok.Builder; import lombok.Data;
import java.time.LocalDateTime;
@Data @Builder
public class NotificationResponse {
    private Long id;
    private String title, message, type, actionUrl;
    private boolean read;
    private LocalDateTime createdAt;
}
