package com.yourbuildmart.product.service.impl;

import com.yourbuildmart.category.entity.Category;
import com.yourbuildmart.category.repository.CategoryRepository;
import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.product.dto.request.ProductRequest;
import com.yourbuildmart.product.dto.response.ProductResponse;
import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import com.yourbuildmart.product.service.ProductService;
import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.review.repository.ReviewRepository;
import com.yourbuildmart.wishlist.repository.WishlistRepository;
import com.yourbuildmart.category.dto.response.CategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository  productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository   reviewRepository;
    private final FileStorageService fileStorageService;
    private final WishlistRepository wishlistRepository;

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }
        Category category = categoryOrThrow(request.getCategoryId());
        Product product = buildProduct(new Product(), request, category);
        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findOrThrow(id);
        Category category = categoryOrThrow(request.getCategoryId());
        return toResponse(productRepository.save(buildProduct(product, request, category)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(Pageable pageable) {
        return PageResponse.from(productRepository.findByActiveTrue(pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getByCategory(Long categoryId, Pageable pageable) {
        return PageResponse.from(productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toResponse));
    }

    @Override
    public PageResponse<ProductResponse> getByBrand(String brand, Pageable pageable) {
        return PageResponse.from(productRepository.findByBrandIgnoreCaseAndActiveTrue(brand, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getFeatured(Pageable pageable) {
        return PageResponse.from(productRepository.findByFeaturedTrueAndActiveTrue(pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String query, Pageable pageable) {
        return PageResponse.from(productRepository.search(query, pageable).map(this::toResponse));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product p = findOrThrow(id);
        // Soft-delete the product record
        p.setActive(false);
        productRepository.save(p);
        // Remove all wishlist entries for this product so users don't see deleted products
        wishlistRepository.deleteAllByProductId(id);
        // Optionally clean up disk images on hard-delete; for soft-delete we keep them
        // so the product can be reactivated. Uncomment the line below for hard-delete:
        // fileStorageService.deleteAllProductImages(id);
    }

    @Override
    @Transactional
    public void updateRating(Long productId) {
        Product product = findOrThrow(productId);
        Double avg   = reviewRepository.avgRating(productId);
        long   count = reviewRepository.countByProductIdAndApprovedTrue(productId);
        product.setAverageRating(avg != null ? avg : 0.0);
        product.setReviewCount((int) count);
        productRepository.save(product);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Product buildProduct(Product p, ProductRequest r, Category cat) {
        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setPrice(r.getPrice());
        p.setOriginalPrice(r.getOriginalPrice());
        p.setStock(r.getStock());
        p.setImageUrl(r.getImageUrl());
        p.setAdditionalImages(r.getAdditionalImages() != null ? r.getAdditionalImages() : p.getAdditionalImages());
        p.setBrand(r.getBrand());
        p.setSku(r.getSku());
        p.setUnit(r.getUnit());
        p.setCategory(cat);
        p.setFeatured(r.isFeatured());
        p.setCashOnDelivery(r.isCashOnDelivery());
        p.setActive(true);
        return p;
    }

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private Category categoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private ProductResponse toResponse(Product p) {
        CategoryResponse catResp = p.getCategory() == null ? null :
                CategoryResponse.builder()
                        .id(p.getCategory().getId())
                        .name(p.getCategory().getName())
                        .imageUrl(p.getCategory().getImageUrl())
                        .build();

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .additionalImages(p.getAdditionalImages())
                .brand(p.getBrand())
                .sku(p.getSku())
                .unit(p.getUnit())
                .active(p.isActive())
                .featured(p.isFeatured())
                .cashOnDelivery(p.isCashOnDelivery())
                .averageRating(p.getAverageRating())
                .reviewCount(p.getReviewCount())
                .category(catResp)
                .createdAt(p.getCreatedAt())
                .brochureUrl(p.getBrochureUrl())
                .build();
    }
}
