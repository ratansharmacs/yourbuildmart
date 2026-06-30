package com.yourbuildmart.category.controller;

import com.yourbuildmart.category.entity.Category;
import com.yourbuildmart.category.repository.CategoryRepository;
import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Manages image uploads for categories.
 *
 * Stored at: uploads/categories/{categoryId}/{uuid}.{ext}
 * Served at: GET /uploads/categories/{categoryId}/{uuid}.{ext}
 *
 *   POST   /categories/{id}/image  – upload / replace category image
 *   DELETE /categories/{id}/image  – remove category image
 */
@RestController
@RequestMapping("/categories/{id}/image")
@RequiredArgsConstructor
@Tag(name = "Category Images", description = "Upload and manage category images stored on local disk")
public class CategoryImageController {

    private final CategoryRepository categoryRepository;
    private final FileStorageService  fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload or replace the image of a category (Admin)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {

        Category category = findOrThrow(id);

        // Delete old image from disk if it was stored locally
        if (category.getImageUrl() != null) {
            fileStorageService.deleteImage(category.getImageUrl());
        }

        // Reuse the same storage helper; categories get their own sub-folder
        String url = fileStorageService.storeCategoryImage(id, image);
        category.setImageUrl(url);
        categoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.success(
                "Category image uploaded", Map.of("imageUrl", url)));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove the image of a category (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        Category category = findOrThrow(id);

        if (category.getImageUrl() == null || category.getImageUrl().isBlank()) {
            return ResponseEntity.ok(ApiResponse.success("Category has no image to remove"));
        }
        fileStorageService.deleteImage(category.getImageUrl());
        category.setImageUrl(null);
        categoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.success("Category image removed"));
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}

/**
 * Manages icon uploads for categories, mounted at /categories/{id}/icon
 *   POST   /categories/{id}/icon  – upload / replace category icon
 *   DELETE /categories/{id}/icon  – remove category icon
 */
@RestController
@RequestMapping("/categories/{id}/icon")
@RequiredArgsConstructor
@Tag(name = "Category Icons", description = "Upload and manage category icons stored on local disk")
class CategoryIconController {

    private final CategoryRepository categoryRepository;
    private final FileStorageService  fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload or replace the icon of a category (Admin)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadIcon(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {

        Category category = findOrThrow(id);

        if (category.getIconUrl() != null) {
            fileStorageService.deleteImage(category.getIconUrl());
        }

        String url = fileStorageService.storeCategoryImage(id, image);
        category.setIconUrl(url);
        categoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.success(
                "Category icon uploaded", Map.of("iconUrl", url)));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove the icon of a category (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteIcon(@PathVariable Long id) {
        Category category = findOrThrow(id);

        if (category.getIconUrl() == null || category.getIconUrl().isBlank()) {
            return ResponseEntity.ok(ApiResponse.success("Category has no icon to remove"));
        }
        fileStorageService.deleteImage(category.getIconUrl());
        category.setIconUrl(null);
        categoryRepository.save(category);

        return ResponseEntity.ok(ApiResponse.success("Category icon removed"));
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
