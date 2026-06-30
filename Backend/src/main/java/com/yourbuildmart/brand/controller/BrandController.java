package com.yourbuildmart.brand.controller;

import com.yourbuildmart.brand.dto.request.BrandRequest;
import com.yourbuildmart.brand.dto.response.BrandResponse;
import com.yourbuildmart.brand.service.impl.BrandService;
import com.yourbuildmart.common.response.ApiResponse;
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

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Brand management with image storage")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "List all brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved", brandService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Brand retrieved", brandService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new brand (Admin)")
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand created", brandService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update brand (Admin)")
    public ResponseEntity<ApiResponse<BrandResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated", brandService.update(id, request)));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Upload/replace brand logo image (Admin)")
    public ResponseEntity<ApiResponse<BrandResponse>> uploadImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(ApiResponse.success("Brand image uploaded", brandService.uploadImage(id, image)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete brand (Admin)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted"));
    }
}
