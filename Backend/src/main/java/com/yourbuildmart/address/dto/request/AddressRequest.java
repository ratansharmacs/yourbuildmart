package com.yourbuildmart.address.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
@Data
public class AddressRequest {
    @NotBlank private String fullName;
    @NotBlank @Pattern(regexp="^[+]?[0-9]{7,15}$") private String phone;
    @NotBlank private String addressLine1;
    private String addressLine2;
    @NotBlank private String city, state, country;
    @NotBlank private String postalCode;
    private boolean isDefault;
    private String addressType;
}
