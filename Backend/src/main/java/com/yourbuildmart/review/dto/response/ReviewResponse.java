package com.yourbuildmart.review.dto.response;
import lombok.Builder; import lombok.Data;
import java.time.LocalDateTime;
@Data @Builder
public class ReviewResponse {
    private Long id, productId;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private boolean approved;
    private LocalDateTime createdAt;
}
