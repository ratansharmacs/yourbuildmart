package com.yourbuildmart.blog.entity;

import com.yourbuildmart.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "blog_posts")
public class BlogPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 400)
    private String title;

    @Column(unique = true, length = 400)
    private String slug;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    // Banner image stored on disk; relative URL path e.g. /uploads/blogs/5/abc.jpg
    @Column(name = "banner_image_url", length = 500)
    private String bannerImageUrl;

    // Meta image stored on disk
    @Column(name = "meta_image_url", length = 500)
    private String metaImageUrl;

    @Column(name = "meta_title", length = 400)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "meta_keywords", length = 600)
    private String metaKeywords;

    @Column(nullable = false)
    private boolean published = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BlogCategory category;
}
