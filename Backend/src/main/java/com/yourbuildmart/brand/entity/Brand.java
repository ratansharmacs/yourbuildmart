package com.yourbuildmart.brand.entity;

import com.yourbuildmart.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    /** Public URL or relative path of the brand logo image */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    /** External or internal brand page URL */
    @Column(length = 512)
    private String href;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(length = 255)
    private String slug;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
