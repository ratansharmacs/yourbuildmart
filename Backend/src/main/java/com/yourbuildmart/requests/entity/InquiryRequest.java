package com.yourbuildmart.requests.entity;

import com.yourbuildmart.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Unified table for agent-registration requests and contact-us requests.
 * type = AGENT | CONTACT
 * status = PENDING | REPLIED | DISCARDED
 */
@Entity
@Table(name = "inquiry_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InquiryRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryType type;                // AGENT | CONTACT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PENDING;

    /* ── Common fields ─────────────────────────────────────── */
    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String message;                  // requirements (contact) or general note

    /* ── Contact-only fields ───────────────────────────────── */
    @Column(length = 150)
    private String product;

    @Column(length = 50)
    private String quantity;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    /* ── Agent-only fields ─────────────────────────────────── */
    @Column(length = 200)
    private String shopName;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 200)
    private String password;                 // hashed password requested by agent form

    /* ── Admin reply ───────────────────────────────────────── */
    @Column(columnDefinition = "TEXT")
    private String adminReply;

    @Column
    private java.time.LocalDateTime repliedAt;

    /* ── Enums ─────────────────────────────────────────────── */
    public enum InquiryType   { AGENT, CONTACT }
    public enum InquiryStatus { PENDING, REPLIED, DISCARDED }
}
