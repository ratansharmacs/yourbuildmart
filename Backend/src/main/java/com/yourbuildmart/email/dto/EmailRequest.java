package com.yourbuildmart.email.dto;

import com.yourbuildmart.email.enums.EmailType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmailRequest {

    private String    to;
    private String    userName;
    private EmailType emailType;

    // Agent / contact specific
    private String shopName;
    private String userEmail;
    private String userPhone;
    private String userAddress;

    // Admin reply
    private String adminReply;

    // Enquiry (order) specific
    private String orderNumber;
    private String orderItemsSummary;   // plain-text list of items
    private String enquiryOrganization;

    // Contact form specific
    private String contactProduct;
    private String contactQuantity;
    private String contactCountry;
    private String contactCity;
    private String contactMessage;
    private String contactPhone;
}
