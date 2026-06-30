package com.yourbuildmart.category.dto.response;
import lombok.Builder; import lombok.Data;
import java.util.List;
@Data @Builder
public class CategoryResponse {
    private Long id;
    private String name, description, imageUrl, iconUrl;
    private boolean active;
    private Long parentId;
    private String parentName;
    private String metaTitle;
    private String metaDescription;
    private String slug;
    private Integer orderLevel;
    private String categoryType;
    private boolean featured;
    private Double commission;
    private int level;
    private List<CategoryResponse> subCategories;
}
