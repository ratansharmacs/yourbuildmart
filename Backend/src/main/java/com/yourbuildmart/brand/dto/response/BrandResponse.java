package com.yourbuildmart.brand.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class BrandResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private String href;
    private String metaTitle;
    private String metaDescription;
    private String slug;
    private boolean active;
    private LocalDateTime createdAt;
}
