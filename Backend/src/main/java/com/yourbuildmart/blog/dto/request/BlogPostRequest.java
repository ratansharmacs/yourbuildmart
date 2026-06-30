package com.yourbuildmart.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogPostRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String slug;

    @NotBlank(message = "Short description is required")
    private String shortDescription;

    private String description;

    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;

    private boolean published = true;
}
