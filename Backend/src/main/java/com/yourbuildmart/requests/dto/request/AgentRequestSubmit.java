package com.yourbuildmart.requests.dto.request;

import lombok.Data;

@Data
public class AgentRequestSubmit {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword;
    private String shopName;
    private String address;
}
