package com.yourbuildmart.order.dto.request;

import lombok.Data;

@Data
public class AdminUpdateOrderRequest {
    private String status;
    private String paymentStatus;
    private String deliveryPartner;
    private String trackingId;
    private String trackingUrl;
}
