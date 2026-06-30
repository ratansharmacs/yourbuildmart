package com.yourbuildmart.category.service;

import com.yourbuildmart.category.dto.request.CategoryRequest;
import com.yourbuildmart.category.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAll();
    List<CategoryResponse> getRootCategories();
    void delete(Long id);
}
