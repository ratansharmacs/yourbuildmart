package com.yourbuildmart.requests.dto.response;

import com.yourbuildmart.requests.entity.InquiryRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class InquiryRequestResponse {
    private Long          id;
    private String        type;
    private String        status;
    private String        firstName;
    private String        lastName;
    private String        email;
    private String        phone;
    private String        message;
    private String        product;
    private String        quantity;
    private String        country;
    private String        city;
    private String        shopName;
    private String        address;
    private String        adminReply;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static InquiryRequestResponse from(InquiryRequest r) {
        return InquiryRequestResponse.builder()
                .id(r.getId())
                .type(r.getType().name())
                .status(r.getStatus().name())
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .message(r.getMessage())
                .product(r.getProduct())
                .quantity(r.getQuantity())
                .country(r.getCountry())
                .city(r.getCity())
                .shopName(r.getShopName())
                .address(r.getAddress())
                .adminReply(r.getAdminReply())
                .repliedAt(r.getRepliedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
