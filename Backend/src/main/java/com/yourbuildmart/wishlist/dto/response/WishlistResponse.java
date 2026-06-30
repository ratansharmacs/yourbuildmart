package com.yourbuildmart.wishlist.dto.response;
import lombok.Builder; import lombok.Data;
import java.math.BigDecimal; import java.time.LocalDateTime;
@Data @Builder
public class WishlistResponse {
    private Long id, productId;
    private String productName, imageUrl;
    private BigDecimal price;
    private LocalDateTime addedAt;
    private Boolean wishlisted;
}
