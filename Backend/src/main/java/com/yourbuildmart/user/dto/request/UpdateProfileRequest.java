package com.yourbuildmart.user.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
@Data
public class UpdateProfileRequest {
    @NotBlank @Size(min=2,max=50) private String firstName;
    @NotBlank @Size(min=2,max=50) private String lastName;
    @NotBlank @Pattern(regexp="^[+]?[0-9]{7,15}$") private String phone;
    private String profileImage;
}
