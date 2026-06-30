package com.yourbuildmart.analytics.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Records every search query submitted by visitors and logged-in users.
 * Powers the Admin › Reports › User Searches panel.
 */
@Entity
@Table(name = "search_logs", indexes = {
    @Index(name = "idx_sl_query",      columnList = "query"),
    @Index(name = "idx_sl_created_at", columnList = "created_at"),
    @Index(name = "idx_sl_user_id",    columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class SearchLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The raw search text entered by the user. */
    @Column(nullable = false, length = 300)
    private String query;

    /** Null means a guest / unauthenticated visitor. */
    @Column(name = "user_id")
    private Long userId;

    /** Name or email for display in the admin table. */
    @Column(name = "user_name", length = 150)
    private String userName;

    /** Where the search originated: "header" or "product-page". */
    @Column(length = 60)
    private String source;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
