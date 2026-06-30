package com.yourbuildmart.order.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String deliveryPartner;
    private String trackingId;
    private String trackingUrl;
    private BigDecimal totalAmount;

    private String customerName;
    private String customerEmail;

    private String enquiryName;
    private String enquiryEmail;
    private String enquiryOrganization;
    private String enquiryCountry;
    private String enquiryPhone;
    private String enquiryText;

    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
