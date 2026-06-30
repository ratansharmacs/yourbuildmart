package com.yourbuildmart.blog.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourbuildmart.blog.dto.request.BlogCategoryRequest;
import com.yourbuildmart.blog.dto.request.BlogPostRequest;
import com.yourbuildmart.blog.dto.response.BlogCategoryResponse;
import com.yourbuildmart.blog.dto.response.BlogPostResponse;
import com.yourbuildmart.blog.service.BlogService;
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

/**
 * REST controller for the blog system.
 *
 * Public  GET routes: /blog/categories, /blog/posts, /blog/posts/{id}, /blog/posts/slug/{slug}
 * Admin-only routes: POST/PUT/DELETE /blog/categories, POST/PUT/DELETE /blog/posts, PATCH /blog/posts/{id}/toggle
 */
@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
@Tag(name = "Blog", description = "Blog posts and categories")
public class BlogController {

    private final BlogService   blogService;
    private final ObjectMapper  objectMapper;

    // ── Blog Categories (public read, admin write) ────────────────────────────

    @GetMapping("/categories")
    @Operation(summary = "List all blog categories")
    public ResponseEntity<ApiResponse<List<BlogCategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", blogService.getAllCategories()));
    }

    @GetMapping("/categories/{id}")
    @Operation(summary = "Get blog category by ID")
    public ResponseEntity<ApiResponse<BlogCategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category retrieved", blogService.getCategoryById(id)));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a blog category (Admin)")
    public ResponseEntity<ApiResponse<BlogCategoryResponse>> createCategory(
            @Valid @RequestBody BlogCategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Category created", blogService.createCategory(req)));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update a blog category (Admin)")
    public ResponseEntity<ApiResponse<BlogCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody BlogCategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", blogService.updateCategory(id, req)));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete a blog category (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        blogService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    // ── Blog Posts (public read, admin write) ─────────────────────────────────

    @GetMapping("/posts")
    @Operation(summary = "List all blog posts (admin sees unpublished too; public sees published only)")
    public ResponseEntity<ApiResponse<List<BlogPostResponse>>> getAllPosts(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        List<BlogPostResponse> posts = all ? blogService.getAllPosts() : blogService.getPublishedPosts();
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved", posts));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get blog post by ID")
    public ResponseEntity<ApiResponse<BlogPostResponse>> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Post retrieved", blogService.getPostById(id)));
    }

    @GetMapping("/posts/slug/{slug}")
    @Operation(summary = "Get blog post by slug")
    public ResponseEntity<ApiResponse<BlogPostResponse>> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success("Post retrieved", blogService.getPostBySlug(slug)));
    }

    /**
     * Create a blog post.
     * Accepts multipart/form-data with:
     *  - "data"      : JSON blob of BlogPostRequest
     *  - "banner"    : (optional) banner image file
     *  - "metaImage" : (optional) meta image file
     */
    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a blog post with optional images (Admin)")
    public ResponseEntity<ApiResponse<BlogPostResponse>> createPost(
            @RequestPart("data")                          String           dataJson,
            @RequestPart(value = "banner",    required = false) MultipartFile bannerFile,
            @RequestPart(value = "metaImage", required = false) MultipartFile metaImageFile) throws Exception {

        BlogPostRequest req = objectMapper.readValue(dataJson, BlogPostRequest.class);
        return ResponseEntity.ok(ApiResponse.success("Post created",
                blogService.createPost(req, bannerFile, metaImageFile)));
    }

    /**
     * Update a blog post (same multipart structure as create).
     */
    @PutMapping(value = "/posts/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update a blog post with optional images (Admin)")
    public ResponseEntity<ApiResponse<BlogPostResponse>> updatePost(
            @PathVariable                                       Long          id,
            @RequestPart("data")                               String        dataJson,
            @RequestPart(value = "banner",    required = false) MultipartFile bannerFile,
            @RequestPart(value = "metaImage", required = false) MultipartFile metaImageFile) throws Exception {

        BlogPostRequest req = objectMapper.readValue(dataJson, BlogPostRequest.class);
        return ResponseEntity.ok(ApiResponse.success("Post updated",
                blogService.updatePost(id, req, bannerFile, metaImageFile)));
    }

    @PatchMapping("/posts/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Toggle published status of a post (Admin)")
    public ResponseEntity<ApiResponse<BlogPostResponse>> togglePublished(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Published status toggled",
                blogService.togglePublished(id)));
    }

    @DeleteMapping("/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete a blog post and its images (Admin)")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted"));
    }
}
