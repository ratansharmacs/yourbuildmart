package com.yourbuildmart.requests.dto.request;

import lombok.Data;

@Data
public class ContactRequestSubmit {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String product;
    private String quantity;
    private String country;
    private String city;
    private String message;       // maps to "requirements" on the form
}
