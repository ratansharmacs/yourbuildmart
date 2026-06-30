package com.yourbuildmart.order.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
}
