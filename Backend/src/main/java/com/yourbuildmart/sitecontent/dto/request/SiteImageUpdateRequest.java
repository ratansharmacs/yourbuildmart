package com.yourbuildmart.sitecontent.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SiteImageUpdateRequest {
    @NotBlank
    private String imageUrl;
}
