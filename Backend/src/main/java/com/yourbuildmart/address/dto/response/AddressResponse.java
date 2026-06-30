package com.yourbuildmart.address.dto.response;
import lombok.Builder; import lombok.Data;
@Data @Builder
public class AddressResponse {
    private Long id;
    private String fullName, phone, addressLine1, addressLine2;
    private String city, state, country, postalCode, addressType;
    private boolean isDefault;
}
