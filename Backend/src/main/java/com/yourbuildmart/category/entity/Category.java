package com.yourbuildmart.category.entity;

import com.yourbuildmart.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(length = 255)
    private String slug;

    @Column(name = "order_level")
    @Builder.Default
    private Integer orderLevel = 0;

    @Column(name = "category_type", length = 50)
    @Builder.Default
    private String categoryType = "Physical";

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column
    @Builder.Default
    private Double commission = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Self-referencing for sub-categories */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Category> subCategories = new ArrayList<>();
}
