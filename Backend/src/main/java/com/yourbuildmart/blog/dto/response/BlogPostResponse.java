package com.yourbuildmart.blog.dto.response;

import com.yourbuildmart.blog.entity.BlogPost;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BlogPostResponse {
    private final Long          id;
    private final String        title;
    private final String        slug;
    private final String        shortDescription;
    private final String        description;
    private final String        bannerImageUrl;
    private final String        metaImageUrl;
    private final String        metaTitle;
    private final String        metaDescription;
    private final String        metaKeywords;
    private final boolean       published;
    private final Long          categoryId;
    private final String        categoryName;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public BlogPostResponse(BlogPost p) {
        this.id               = p.getId();
        this.title            = p.getTitle();
        this.slug             = p.getSlug();
        this.shortDescription = p.getShortDescription();
        this.description      = p.getDescription();
        this.bannerImageUrl   = p.getBannerImageUrl();
        this.metaImageUrl     = p.getMetaImageUrl();
        this.metaTitle        = p.getMetaTitle();
        this.metaDescription  = p.getMetaDescription();
        this.metaKeywords     = p.getMetaKeywords();
        this.published        = p.isPublished();
        this.categoryId       = p.getCategory() != null ? p.getCategory().getId()   : null;
        this.categoryName     = p.getCategory() != null ? p.getCategory().getName() : null;
        this.createdAt        = p.getCreatedAt();
        this.updatedAt        = p.getUpdatedAt();
    }
}
