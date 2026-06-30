package com.yourbuildmart.product.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
import java.math.BigDecimal; import java.util.List;
@Data
public class ProductRequest {
    @NotBlank @Size(min=2,max=200) private String name;
    private String description;
    @DecimalMin("0.01") private BigDecimal price;
    private BigDecimal originalPrice;
    @NotNull @Min(0) private Integer stock;
    private String imageUrl, brand, sku, unit;
    @NotNull private Long categoryId;
    private List<String> additionalImages;
    private boolean featured;
    private boolean cashOnDelivery = true;
}
