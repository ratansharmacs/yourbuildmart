package com.yourbuildmart.category.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
@Data
public class CategoryRequest {
    @NotBlank @Size(min=2,max=100) private String name;
    private String description, imageUrl, iconUrl;
    private Long parentId;
    private String metaTitle;
    private String metaDescription;
    private String slug;
    private Integer orderLevel;
    private String categoryType;
    private boolean featured;
    private Double commission;
}
