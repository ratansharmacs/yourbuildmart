package com.yourbuildmart.notification.entity;

import com.yourbuildmart.common.util.BaseEntity;
import com.yourbuildmart.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationType type = NotificationType.INFO;

    /** Optional deep-link (e.g. /orders/123) */
    @Column(name = "action_url")
    private String actionUrl;

    public enum NotificationType {
        ORDER_PLACED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED,
        PAYMENT_SUCCESS, PAYMENT_FAILED,
        REVIEW_APPROVED, PROMO, INFO
    }
}
