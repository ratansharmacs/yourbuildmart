package com.yourbuildmart.blog.service;

import com.yourbuildmart.blog.dto.request.BlogCategoryRequest;
import com.yourbuildmart.blog.dto.request.BlogPostRequest;
import com.yourbuildmart.blog.dto.response.BlogCategoryResponse;
import com.yourbuildmart.blog.dto.response.BlogPostResponse;
import com.yourbuildmart.blog.entity.BlogCategory;
import com.yourbuildmart.blog.entity.BlogPost;
import com.yourbuildmart.blog.repository.BlogCategoryRepository;
import com.yourbuildmart.blog.repository.BlogPostRepository;
import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogCategoryRepository categoryRepo;
    private final BlogPostRepository     postRepo;
    private final FileStorageService     fileStorageService;

    // ── Categories ────────────────────────────────────────────────────────────

    public List<BlogCategoryResponse> getAllCategories() {
        return categoryRepo.findAll()
                .stream()
                .map(BlogCategoryResponse::new)
                .collect(Collectors.toList());
    }

    public BlogCategoryResponse getCategoryById(Long id) {
        return new BlogCategoryResponse(findCategoryOrThrow(id));
    }

    @Transactional
    public BlogCategoryResponse createCategory(BlogCategoryRequest req) {
        if (categoryRepo.existsByNameIgnoreCase(req.getName().trim())) {
            throw new BadRequestException("Blog category with name \"" + req.getName() + "\" already exists");
        }
        BlogCategory cat = new BlogCategory();
        cat.setName(req.getName().trim());
        return new BlogCategoryResponse(categoryRepo.save(cat));
    }

    @Transactional
    public BlogCategoryResponse updateCategory(Long id, BlogCategoryRequest req) {
        BlogCategory cat = findCategoryOrThrow(id);
        cat.setName(req.getName().trim());
        return new BlogCategoryResponse(categoryRepo.save(cat));
    }

    @Transactional
    public void deleteCategory(Long id) {
        findCategoryOrThrow(id);
        categoryRepo.deleteById(id);
    }

    // ── Posts ─────────────────────────────────────────────────────────────────

    public List<BlogPostResponse> getAllPosts() {
        return postRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BlogPostResponse::new)
                .collect(Collectors.toList());
    }

    public List<BlogPostResponse> getPublishedPosts() {
        return postRepo.findByPublishedTrueOrderByCreatedAtDesc()
                .stream()
                .map(BlogPostResponse::new)
                .collect(Collectors.toList());
    }

    public BlogPostResponse getPostById(Long id) {
        return new BlogPostResponse(findPostOrThrow(id));
    }

    public BlogPostResponse getPostBySlug(String slug) {
        BlogPost post = postRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "slug", slug));
        return new BlogPostResponse(post);
    }

    @Transactional
    public BlogPostResponse createPost(BlogPostRequest req,
                                       MultipartFile bannerFile,
                                       MultipartFile metaImageFile) {
        BlogPost post = new BlogPost();
        applyRequest(post, req);

        // Save first to get the ID, then upload images using that ID as folder
        BlogPost saved = postRepo.save(post);

        uploadImages(saved, bannerFile, metaImageFile);

        return new BlogPostResponse(postRepo.save(saved));
    }

    @Transactional
    public BlogPostResponse updatePost(Long id,
                                       BlogPostRequest req,
                                       MultipartFile bannerFile,
                                       MultipartFile metaImageFile) {
        BlogPost post = findPostOrThrow(id);
        applyRequest(post, req);
        uploadImages(post, bannerFile, metaImageFile);
        return new BlogPostResponse(postRepo.save(post));
    }

    @Transactional
    public BlogPostResponse togglePublished(Long id) {
        BlogPost post = findPostOrThrow(id);
        post.setPublished(!post.isPublished());
        return new BlogPostResponse(postRepo.save(post));
    }

    @Transactional
    public void deletePost(Long id) {
        BlogPost post = findPostOrThrow(id);
        // Delete images from disk
        fileStorageService.deleteAllBlogImages(id);
        postRepo.delete(post);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void applyRequest(BlogPost post, BlogPostRequest req) {
        post.setTitle(req.getTitle().trim());
        post.setShortDescription(req.getShortDescription());
        post.setDescription(req.getDescription());
        post.setMetaTitle(req.getMetaTitle());
        post.setMetaDescription(req.getMetaDescription());
        post.setMetaKeywords(req.getMetaKeywords());
        post.setPublished(req.isPublished());

        // Slug: use provided or auto-generate from title
        String slug = (req.getSlug() != null && !req.getSlug().isBlank())
                ? req.getSlug().trim()
                : toSlug(req.getTitle());
        post.setSlug(slug);

        // Category
        if (req.getCategoryId() != null) {
            post.setCategory(findCategoryOrThrow(req.getCategoryId()));
        }
    }

    private void uploadImages(BlogPost post, MultipartFile bannerFile, MultipartFile metaImageFile) {
        if (bannerFile != null && !bannerFile.isEmpty()) {
            // Delete old banner if exists
            if (post.getBannerImageUrl() != null) {
                fileStorageService.deleteImage(post.getBannerImageUrl());
            }
            String url = fileStorageService.storeBlogImage(post.getId(), bannerFile);
            post.setBannerImageUrl(url);
        }
        if (metaImageFile != null && !metaImageFile.isEmpty()) {
            if (post.getMetaImageUrl() != null) {
                fileStorageService.deleteImage(post.getMetaImageUrl());
            }
            String url = fileStorageService.storeBlogImage(post.getId(), metaImageFile);
            post.setMetaImageUrl(url);
        }
    }

    private BlogCategory findCategoryOrThrow(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogCategory", "id", id));
    }

    private BlogPost findPostOrThrow(Long id) {
        return postRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id));
    }

    private static String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");
        return normalized.toLowerCase(Locale.ENGLISH)
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-");
    }
}
