package com.yourbuildmart.product.dto.response;
import com.yourbuildmart.category.dto.response.CategoryResponse;
import lombok.Builder; import lombok.Data;
import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
@Data @Builder
public class ProductResponse {
    private Long id;
    private String name, description, imageUrl, brand, sku, unit;
    private BigDecimal price, originalPrice;
    private Integer stock;
    private boolean active, featured, cashOnDelivery;
    private Double averageRating;
    private Integer reviewCount;
    private CategoryResponse category;
    private List<String> additionalImages;
    private LocalDateTime createdAt;
    private String brochureUrl;
}
