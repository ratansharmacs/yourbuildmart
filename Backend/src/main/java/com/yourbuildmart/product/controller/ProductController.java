package com.yourbuildmart.product.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.product.dto.request.ProductRequest;
import com.yourbuildmart.product.dto.response.ProductResponse;
import com.yourbuildmart.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalogue endpoints")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List all active products (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Products retrieved",
                productService.getAll(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", productService.getById(id)));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "List products by category")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Products retrieved",
                productService.getByCategory(categoryId, PageRequest.of(page, size))));
    }

    @GetMapping("/brand/{brand}")
    @Operation(summary = "List products by brand name")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getByBrand(
            @PathVariable String brand,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Products retrieved",
                productService.getByBrand(brand, PageRequest.of(page, size))));
    }

    @GetMapping("/featured")
    @Operation(summary = "List featured products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getFeatured(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success("Featured products retrieved",
                productService.getFeatured(PageRequest.of(page, size))));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by keyword")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Search results",
                productService.search(q, PageRequest.of(page, size))));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new product (Admin / Seller)")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update a product (Admin / Seller)")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Soft-delete a product (Admin)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }
}
