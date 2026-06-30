package com.yourbuildmart.user.dto.response;
import lombok.Builder; import lombok.Data;
import java.time.LocalDateTime;
@Data @Builder
public class UserResponse {
    private Long id;
    private String firstName, lastName, email, phone, role, profileImage;
    private boolean active;
    private LocalDateTime createdAt;
}
