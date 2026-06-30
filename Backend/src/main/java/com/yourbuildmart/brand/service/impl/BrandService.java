package com.yourbuildmart.brand.service.impl;

import com.yourbuildmart.brand.dto.request.BrandRequest;
import com.yourbuildmart.brand.dto.response.BrandResponse;
import com.yourbuildmart.brand.entity.Brand;
import com.yourbuildmart.brand.repository.BrandRepository;
import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final FileStorageService fileStorageService;

    public List<BrandResponse> getAll() {
        return brandRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BrandResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new BadRequestException("Brand already exists: " + request.getName());
        }
        Brand brand = Brand.builder()
                .name(request.getName())
                .imageUrl(request.getImageUrl())
                .href(request.getHref())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .slug(generateSlug(request.getSlug(), request.getName()))
                .active(request.isActive())
                .build();
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = findOrThrow(id);
        brand.setName(request.getName());
        if (request.getImageUrl() != null) brand.setImageUrl(request.getImageUrl());
        if (request.getHref() != null) brand.setHref(request.getHref());
        brand.setMetaTitle(request.getMetaTitle());
        brand.setMetaDescription(request.getMetaDescription());
        brand.setSlug(generateSlug(request.getSlug(), request.getName()));
        brand.setActive(request.isActive());
        return toResponse(brandRepository.save(brand));
    }

    private String generateSlug(String slug, String name) {
        String base = (slug != null && !slug.isBlank()) ? slug : name;
        if (base == null) return null;
        return base.trim().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s_-]+", "-")
                .replaceAll("^-|-$", "");
    }

    @Transactional
    public BrandResponse uploadImage(Long id, MultipartFile image) {
        Brand brand = findOrThrow(id);
        // Delete old image if it exists on disk
        if (brand.getImageUrl() != null && brand.getImageUrl().startsWith("/uploads/")) {
            fileStorageService.deleteImage(brand.getImageUrl());
        }
        String url = fileStorageService.storeBrandImage(id, image);
        brand.setImageUrl(url);
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public void delete(Long id) {
        Brand brand = findOrThrow(id);
        if (brand.getImageUrl() != null && brand.getImageUrl().startsWith("/uploads/")) {
            fileStorageService.deleteImage(brand.getImageUrl());
        }
        brandRepository.delete(brand);
    }

    private Brand findOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
    }

    private BrandResponse toResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .imageUrl(b.getImageUrl())
                .href(b.getHref())
                .metaTitle(b.getMetaTitle())
                .metaDescription(b.getMetaDescription())
                .slug(b.getSlug())
                .active(b.isActive())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
