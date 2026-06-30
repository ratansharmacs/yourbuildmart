package com.yourbuildmart.category.service.impl;

import com.yourbuildmart.category.dto.request.CategoryRequest;
import com.yourbuildmart.category.dto.response.CategoryResponse;
import com.yourbuildmart.category.entity.Category;
import com.yourbuildmart.category.repository.CategoryRepository;
import com.yourbuildmart.category.service.CategoryService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ConflictException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category already exists: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .iconUrl(request.getIconUrl())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .slug(generateSlug(request.getSlug(), request.getName()))
                .orderLevel(request.getOrderLevel() != null ? request.getOrderLevel() : 0)
                .categoryType(request.getCategoryType() != null ? request.getCategoryType() : "Physical")
                .featured(request.isFeatured())
                .commission(request.getCommission() != null ? request.getCommission() : 0.0)
                .active(true)
                .build();

        if (request.getParentId() != null) {
            Category parent = findOrThrow(request.getParentId());
            category.setParent(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findOrThrow(id);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getIconUrl() != null) category.setIconUrl(request.getIconUrl());
        category.setMetaTitle(request.getMetaTitle());
        category.setMetaDescription(request.getMetaDescription());
        category.setSlug(generateSlug(request.getSlug(), request.getName()));
        category.setOrderLevel(request.getOrderLevel() != null ? request.getOrderLevel() : 0);
        category.setCategoryType(request.getCategoryType() != null ? request.getCategoryType() : "Physical");
        category.setFeatured(request.isFeatured());
        category.setCommission(request.getCommission() != null ? request.getCommission() : 0.0);

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("A category cannot be its own parent");
            }
            category.setParent(findOrThrow(request.getParentId()));
        } else {
            category.setParent(null);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category cat = findOrThrow(id);
        cat.setActive(false);
        categoryRepository.save(cat);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private String generateSlug(String slug, String name) {
        String base = (slug != null && !slug.isBlank()) ? slug : name;
        if (base == null) return null;
        return base.trim().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s_-]+", "-")
                .replaceAll("^-|-$", "");
    }

    private int computeLevel(Category c) {
        int level = 0;
        Category p = c.getParent();
        while (p != null) { level++; p = p.getParent(); }
        return level;
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .iconUrl(c.getIconUrl())
                .active(c.isActive())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .metaTitle(c.getMetaTitle())
                .metaDescription(c.getMetaDescription())
                .slug(c.getSlug())
                .orderLevel(c.getOrderLevel())
                .categoryType(c.getCategoryType())
                .featured(c.isFeatured())
                .commission(c.getCommission())
                .level(computeLevel(c))
                .subCategories(c.getSubCategories().stream()
                        .filter(Category::isActive)
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
