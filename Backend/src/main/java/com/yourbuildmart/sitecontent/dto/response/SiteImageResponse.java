package com.yourbuildmart.sitecontent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteImageResponse {
    private Long id;
    private String page;
    private String slotKey;
    private String label;
    private String imageUrl;
}
