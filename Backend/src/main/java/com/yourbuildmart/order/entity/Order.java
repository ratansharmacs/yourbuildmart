package com.yourbuildmart.order.entity;

import com.yourbuildmart.common.util.BaseEntity;
import com.yourbuildmart.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    // ── Enquiry form fields ──────────────────────────────────────────────────
    @Column(name = "enquiry_name")
    private String enquiryName;

    @Column(name = "enquiry_email")
    private String enquiryEmail;

    @Column(name = "enquiry_organization")
    private String enquiryOrganization;

    @Column(name = "enquiry_country")
    private String enquiryCountry;

    @Column(name = "enquiry_phone")
    private String enquiryPhone;

    @Column(name = "enquiry_text", columnDefinition = "TEXT")
    private String enquiryText;

    // ── Admin-managed delivery fields ────────────────────────────────────────
    @Column(name = "delivery_partner")
    private String deliveryPartner;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UN_PAID;

    @Column(name = "tracking_id")
    private String trackingId;

    @Column(name = "tracking_url", columnDefinition = "TEXT")
    private String trackingUrl;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    public enum PaymentStatus {
        UN_PAID, PAID
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    }

    // ── Manual builder (DevTools RestartClassLoader-safe, replaces @Builder) ──

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String      orderNumber;
        private User        user;
        private OrderStatus status        = OrderStatus.PENDING;
        private PaymentStatus paymentStatus = PaymentStatus.UN_PAID;
        private String      enquiryName;
        private String      enquiryEmail;
        private String      enquiryOrganization;
        private String      enquiryCountry;
        private String      enquiryPhone;
        private String      enquiryText;
        private String      deliveryPartner;
        private String      trackingId;
        private String      trackingUrl;
        private BigDecimal  totalAmount;

        public Builder orderNumber(String v)          { this.orderNumber          = v; return this; }
        public Builder user(User v)                   { this.user                 = v; return this; }
        public Builder status(OrderStatus v)          { this.status               = v; return this; }
        public Builder paymentStatus(PaymentStatus v) { this.paymentStatus        = v; return this; }
        public Builder enquiryName(String v)          { this.enquiryName          = v; return this; }
        public Builder enquiryEmail(String v)         { this.enquiryEmail         = v; return this; }
        public Builder enquiryOrganization(String v)  { this.enquiryOrganization  = v; return this; }
        public Builder enquiryCountry(String v)       { this.enquiryCountry       = v; return this; }
        public Builder enquiryPhone(String v)         { this.enquiryPhone         = v; return this; }
        public Builder enquiryText(String v)          { this.enquiryText          = v; return this; }
        public Builder deliveryPartner(String v)      { this.deliveryPartner      = v; return this; }
        public Builder trackingId(String v)           { this.trackingId           = v; return this; }
        public Builder trackingUrl(String v)          { this.trackingUrl          = v; return this; }
        public Builder totalAmount(BigDecimal v)      { this.totalAmount          = v; return this; }

        public Order build() {
            Order o = new Order();
            o.orderNumber         = this.orderNumber;
            o.user                = this.user;
            o.status              = this.status;
            o.paymentStatus       = this.paymentStatus;
            o.enquiryName         = this.enquiryName;
            o.enquiryEmail        = this.enquiryEmail;
            o.enquiryOrganization = this.enquiryOrganization;
            o.enquiryCountry      = this.enquiryCountry;
            o.enquiryPhone        = this.enquiryPhone;
            o.enquiryText         = this.enquiryText;
            o.deliveryPartner     = this.deliveryPartner;
            o.trackingId          = this.trackingId;
            o.trackingUrl         = this.trackingUrl;
            o.totalAmount         = this.totalAmount;
            return o;
        }
    }
}
