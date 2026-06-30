package com.yourbuildmart.product.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Manages image uploads and removals for individual products.
 *
 * All images are stored on disk under:
 *   uploads/products/{productId}/{uuid}.{ext}
 *
 * Endpoints:
 *   POST   /products/{id}/images/primary            – upload / replace primary image
 *   POST   /products/{id}/images/additional         – upload 1+ additional images
 *   DELETE /products/{id}/images/primary            – remove primary image
 *   DELETE /products/{id}/images/additional/{index} – remove additional image by 0-based index
 *   DELETE /products/{id}/images/all                – remove ALL images for the product
 *   GET    /products/{id}/images                    – list all image URLs
 */
@RestController
@RequestMapping("/products/{id}/images")
@RequiredArgsConstructor
@Tag(name = "Product Images", description = "Upload and manage product images stored on local disk")
public class ProductImageController {

    private final ProductRepository  productRepository;
    private final FileStorageService fileStorageService;

    // ── Upload primary image ──────────────────────────────────────────────────

    @PostMapping(value = "/primary", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload or replace the primary image of a product")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPrimary(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {

        Product product = findOrThrow(id);

        // Delete old primary if it lives on disk
        if (product.getImageUrl() != null) {
            fileStorageService.deleteImage(product.getImageUrl());
        }

        String url = fileStorageService.storeProductImage(id, image);
        product.setImageUrl(url);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success(
                "Primary image uploaded", Map.of("imageUrl", url)));
    }

    // ── Upload additional images ──────────────────────────────────────────────

    @PostMapping(value = "/additional", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload one or more additional images for a product")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAdditional(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images) {

        if (images == null || images.isEmpty()) {
            throw new BadRequestException("No images provided");
        }

        Product product = findOrThrow(id);
        List<String> newUrls = fileStorageService.storeProductImages(id, images);

        List<String> all = new ArrayList<>(product.getAdditionalImages());
        all.addAll(newUrls);
        product.setAdditionalImages(all);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success(
                newUrls.size() + " additional image(s) uploaded",
                Map.of("addedUrls", newUrls, "allAdditionalImages", all)));
    }

    // ── List all image URLs ───────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all image URLs (primary + additional) for a product")
    public ResponseEntity<ApiResponse<Map<String, Object>>> listImages(@PathVariable Long id) {
        Product product = findOrThrow(id);
        return ResponseEntity.ok(ApiResponse.success("Images retrieved",
                Map.of(
                    "productId",        id,
                    "primaryImage",     product.getImageUrl() != null ? product.getImageUrl() : "",
                    "additionalImages", product.getAdditionalImages()
                )));
    }

    // ── Delete primary image ──────────────────────────────────────────────────

    @DeleteMapping("/primary")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove the primary image of a product")
    public ResponseEntity<ApiResponse<Void>> deletePrimary(@PathVariable Long id) {
        Product product = findOrThrow(id);

        if (product.getImageUrl() == null || product.getImageUrl().isBlank()) {
            throw new BadRequestException("Product has no primary image");
        }
        fileStorageService.deleteImage(product.getImageUrl());
        product.setImageUrl(null);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success("Primary image removed"));
    }

    // ── Delete one additional image by index ─────────────────────────────────

    @DeleteMapping("/additional/{index}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove an additional image by its 0-based list index")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAdditional(
            @PathVariable Long id,
            @PathVariable int index) {

        Product product = findOrThrow(id);
        List<String> imgs = new ArrayList<>(product.getAdditionalImages());

        if (index < 0 || index >= imgs.size()) {
            throw new BadRequestException(
                    "Index " + index + " is out of range. " +
                    "Product has " + imgs.size() + " additional image(s) (0-based).");
        }

        String removed = imgs.remove(index);
        fileStorageService.deleteImage(removed);
        product.setAdditionalImages(imgs);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success(
                "Additional image at index " + index + " removed",
                Map.of("remainingAdditionalImages", imgs)));
    }

    // ── Delete ALL images for a product ──────────────────────────────────────

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove ALL images for a product (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteAll(@PathVariable Long id) {
        Product product = findOrThrow(id);

        fileStorageService.deleteAllProductImages(id);   // wipes the entire productDir
        product.setImageUrl(null);
        product.setAdditionalImages(new ArrayList<>());
        productRepository.save(product);

        return ResponseEntity.ok(
                ApiResponse.success("All images removed for product " + id));
    }

    // ── Upload brochure ───────────────────────────────────────────────────────

    @PostMapping(value = "/brochure", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload or replace the brochure (PDF/DOC) for a product")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadBrochure(
            @PathVariable Long id,
            @RequestPart("brochure") MultipartFile brochure) {

        Product product = findOrThrow(id);

        // Delete old brochure file if present
        if (product.getBrochureUrl() != null && !product.getBrochureUrl().isBlank()) {
            fileStorageService.deleteFile(product.getBrochureUrl());
        }

        String url = fileStorageService.storeProductBrochure(id, brochure);
        product.setBrochureUrl(url);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success(
                "Brochure uploaded successfully", Map.of("brochureUrl", url)));
    }

    // ── Delete brochure ───────────────────────────────────────────────────────

    @DeleteMapping("/brochure")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Remove the brochure for a product")
    public ResponseEntity<ApiResponse<Void>> deleteBrochure(@PathVariable Long id) {
        Product product = findOrThrow(id);

        if (product.getBrochureUrl() == null || product.getBrochureUrl().isBlank()) {
            throw new BadRequestException("Product has no brochure to delete");
        }
        fileStorageService.deleteFile(product.getBrochureUrl());
        product.setBrochureUrl(null);
        productRepository.save(product);

        return ResponseEntity.ok(ApiResponse.success("Brochure removed for product " + id));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }
}
