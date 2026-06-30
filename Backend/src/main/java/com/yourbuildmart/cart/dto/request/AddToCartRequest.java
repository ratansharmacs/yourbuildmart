package com.yourbuildmart.cart.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
@Data
public class AddToCartRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
}
