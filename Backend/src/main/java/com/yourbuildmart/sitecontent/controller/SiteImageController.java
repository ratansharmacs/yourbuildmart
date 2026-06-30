package com.yourbuildmart.sitecontent.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.sitecontent.dto.response.SiteImageResponse;
import com.yourbuildmart.sitecontent.service.SiteImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public, read-only endpoint that the storefront calls once on app load to
 * resolve every admin-manageable image slot (Home, About, header/footer
 * logo, Quality Assurance, etc.) in a single request.
 */
@RestController
@RequestMapping("/site-images")
@RequiredArgsConstructor
@Tag(name = "Site Images", description = "Public read access to admin-managed website images")
public class SiteImageController {

    private final SiteImageService siteImageService;

    @GetMapping
    @Operation(summary = "Get all site images grouped by page")
    public ResponseEntity<ApiResponse<Map<String, List<SiteImageResponse>>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success("Site images retrieved", siteImageService.getAllGroupedByPage()));
    }
}
