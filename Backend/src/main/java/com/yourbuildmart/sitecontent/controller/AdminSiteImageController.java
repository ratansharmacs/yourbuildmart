package com.yourbuildmart.sitecontent.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.sitecontent.dto.request.SiteImageUpdateRequest;
import com.yourbuildmart.sitecontent.dto.response.SiteImageResponse;
import com.yourbuildmart.sitecontent.service.SiteImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Admin endpoints for the "Website Setup → Images" panel.
 *
 * Every image used on the live site (Home, About, Quality Assurance,
 * header/footer logo, etc.) is represented as a row here. The admin can
 * either paste a direct image URL or upload a file, which is stored under
 * uploads/site/{page}/{uuid}.{ext}.
 *
 * Endpoints:
 *   GET  /admin/site-images              – flat list of every image slot
 *   PUT  /admin/site-images/{id}         – set image URL directly (paste a link)
 *   POST /admin/site-images/{id}/upload  – upload a file for this slot
 */
@RestController
@RequestMapping("/admin/site-images")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin – Site Images", description = "Manage website images page-wise from the admin panel")
public class AdminSiteImageController {

    private final SiteImageService siteImageService;

    @GetMapping
    @Operation(summary = "List all manageable website image slots")
    public ResponseEntity<ApiResponse<List<SiteImageResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success("Site images retrieved", siteImageService.getAllForAdmin()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an image slot by pasting a direct URL")
    public ResponseEntity<ApiResponse<SiteImageResponse>> updateUrl(
            @PathVariable Long id, @Valid @RequestBody SiteImageUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Image updated", siteImageService.updateUrl(id, request.getImageUrl())));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file for an image slot")
    public ResponseEntity<ApiResponse<SiteImageResponse>> upload(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.success("Image uploaded", siteImageService.uploadImage(id, file)));
    }
}
