package com.yourbuildmart.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;
}
