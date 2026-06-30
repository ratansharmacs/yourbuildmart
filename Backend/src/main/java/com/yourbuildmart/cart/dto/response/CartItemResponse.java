package com.yourbuildmart.cart.dto.response;
import lombok.Builder; import lombok.Data;
import java.math.BigDecimal;
@Data @Builder
public class CartItemResponse {
    private Long cartItemId, productId;
    private String productName, imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice, totalPrice;
}
