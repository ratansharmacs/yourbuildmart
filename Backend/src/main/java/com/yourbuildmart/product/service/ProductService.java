package com.yourbuildmart.product.service;

import com.yourbuildmart.common.response.PageResponse;
import com.yourbuildmart.product.dto.request.ProductRequest;
import com.yourbuildmart.product.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    ProductResponse getById(Long id);
    PageResponse<ProductResponse> getAll(Pageable pageable);
    PageResponse<ProductResponse> getByCategory(Long categoryId, Pageable pageable);
    PageResponse<ProductResponse> getByBrand(String brand, Pageable pageable);
    PageResponse<ProductResponse> getFeatured(Pageable pageable);
    PageResponse<ProductResponse> search(String query, Pageable pageable);
    void delete(Long id);
    void updateRating(Long productId);
}
