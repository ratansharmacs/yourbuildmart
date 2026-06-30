package com.yourbuildmart.blog.dto.response;

import com.yourbuildmart.blog.entity.BlogCategory;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BlogCategoryResponse {
    private final Long          id;
    private final String        name;
    private final LocalDateTime createdAt;

    public BlogCategoryResponse(BlogCategory c) {
        this.id        = c.getId();
        this.name      = c.getName();
        this.createdAt = c.getCreatedAt();
    }
}
