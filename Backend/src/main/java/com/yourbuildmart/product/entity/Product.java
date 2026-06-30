package com.yourbuildmart.product.entity;

import com.yourbuildmart.category.entity.Category;
import com.yourbuildmart.common.util.BaseEntity;
import com.yourbuildmart.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "product_images",
        joinColumns = @JoinColumn(name = "product_id"),
        indexes = @Index(name = "idx_product_images_product_id", columnList = "product_id")
    )
    @Column(name = "image_url", length = 512)
    @OrderColumn(name = "image_order")
    @Builder.Default
    private List<String> additionalImages = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    private String brand;
    private String sku;
    private String unit;    // e.g. kg, meter, piece

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "cash_on_delivery", nullable = false)
    @Builder.Default
    private boolean cashOnDelivery = true;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "brochure_url", length = 512)
    private String brochureUrl;
}
