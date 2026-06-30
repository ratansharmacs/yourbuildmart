package com.yourbuildmart.order.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Organization is required")
    private String organization;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Enquiry message is required")
    private String enquiry;
}
