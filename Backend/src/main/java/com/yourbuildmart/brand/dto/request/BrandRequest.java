package com.yourbuildmart.brand.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandRequest {
    @NotBlank private String name;
    private String imageUrl;
    private String href;
    private String metaTitle;
    private String metaDescription;
    private String slug;
    private boolean active = true;
}
