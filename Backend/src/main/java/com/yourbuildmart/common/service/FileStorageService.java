package com.yourbuildmart.common.service;

import com.yourbuildmart.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Handles on-disk storage of product images.
 *
 * Storage layout:
 *   {app.upload.dir}/products/{productId}/{uuid}.{ext}
 *
 * HTTP access (via WebMvcConfig):
 *   GET /uploads/products/{productId}/{uuid}.{ext}
 *
 * Each image filename is a random UUID (no dashes) + lowercase extension,
 * guaranteeing uniqueness across products and upload sessions.
 */
@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size-mb:5}")
    private long maxFileSizeMb;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private static final Set<String> ALLOWED_BROCHURE_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir, "products"));
            Files.createDirectories(Paths.get(uploadDir, "categories"));
            Files.createDirectories(Paths.get(uploadDir, "brands"));
            Files.createDirectories(Paths.get(uploadDir, "blogs"));
            Files.createDirectories(Paths.get(uploadDir, "brochures"));
            Files.createDirectories(Paths.get(uploadDir, "site"));
            log.info("FileStorageService ready. Upload root: {}",
                     Paths.get(uploadDir).toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Store one image for a product.
     *
     * @param productId owning product ID  (used as sub-folder name)
     * @param file      the uploaded MultipartFile
     * @return relative URL path, e.g.  /uploads/products/42/3f4a5b6c7d8e.jpg
     */
    public String storeProductImage(Long productId, MultipartFile file) {
        validate(file);

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path productDir = Paths.get(uploadDir, "products", String.valueOf(productId));
        try {
            Files.createDirectories(productDir);
            Files.copy(file.getInputStream(),
                       productDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored image {} for product {}", filename, productId);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store image for product " + productId + ": " + e.getMessage(), e);
        }

        return "/uploads/products/" + productId + "/" + filename;
    }

    /**
     * Store multiple images for a product in one call.
     *
     * @return list of relative URL paths, preserving input order
     */
    public List<String> storeProductImages(Long productId, List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(storeProductImage(productId, file));
        }
        return urls;
    }

    /**
     * Store one image for a category.
     *
     * @param categoryId owning category ID (used as sub-folder name)
     * @param file       the uploaded MultipartFile
     * @return relative URL path, e.g.  /uploads/categories/5/a1b2c3d4.jpg
     */
    public String storeCategoryImage(Long categoryId, MultipartFile file) {
        validate(file);

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path categoryDir = Paths.get(uploadDir, "categories", String.valueOf(categoryId));
        try {
            Files.createDirectories(categoryDir);
            Files.copy(file.getInputStream(),
                       categoryDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored image {} for category {}", filename, categoryId);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store image for category " + categoryId + ": " + e.getMessage(), e);
        }

        return "/uploads/categories/" + categoryId + "/" + filename;
    }

    /**
     * Store one image for a brand (logo).
     *
     * @param brandId owning brand ID (used as sub-folder name)
     * @param file    the uploaded MultipartFile
     * @return relative URL path, e.g.  /uploads/brands/3/a1b2c3d4.png
     */
    public String storeBrandImage(Long brandId, MultipartFile file) {
        validate(file);

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path brandDir = Paths.get(uploadDir, "brands", String.valueOf(brandId));
        try {
            Files.createDirectories(brandDir);
            Files.copy(file.getInputStream(),
                       brandDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored image {} for brand {}", filename, brandId);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store image for brand " + brandId + ": " + e.getMessage(), e);
        }

        return "/uploads/brands/" + brandId + "/" + filename;
    }

    /**
     * Delete a single stored image from disk.
     * Silently ignores missing files or non-local URLs.
     *
     * @param urlPath relative URL path as returned by storeProductImage,
     *                e.g. /uploads/products/42/3f4a5b6c7d8e.jpg
     */
    public void deleteImage(String urlPath) {
        if (urlPath == null || urlPath.isBlank() || !urlPath.startsWith("/uploads/")) return;

        // Strip the "/uploads/" prefix and resolve against the configured uploadDir
        // so deletion always targets the same root as storage, regardless of CWD.
        String relative = urlPath.substring("/uploads/".length()); // e.g. "products/42/abc.jpg"
        Path target = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(relative);
        try {
            boolean deleted = Files.deleteIfExists(target);
            if (deleted) log.debug("Deleted image file: {}", target);
        } catch (IOException e) {
            log.warn("Could not delete image {}: {}", target, e.getMessage());
        }
    }

    /**
     * Generic file delete — works for brochures, images, or any /uploads/ path.
     */
    public void deleteFile(String urlPath) {
        deleteImage(urlPath); // same logic — strip /uploads/ prefix and delete
    }

    /**
     * Delete every image on disk for a given product (entire sub-directory).
     */
    public void deleteAllProductImages(Long productId) {
        Path productDir = Paths.get(uploadDir, "products", String.valueOf(productId));
        if (!Files.exists(productDir)) return;
        try (var stream = Files.walk(productDir)) {
            stream.sorted(Comparator.reverseOrder())
                  .map(Path::toFile)
                  .forEach(f -> { if (!f.delete()) log.warn("Could not delete {}", f); });
            log.info("Deleted all image files for product {}", productId);
        } catch (IOException e) {
            log.warn("Error deleting image directory for product {}: {}", productId, e.getMessage());
        }
    }

    /**
     * Store one image for a blog post (banner or meta image).
     *
     * @param postId owning blog post ID (used as sub-folder name)
     * @param file   the uploaded MultipartFile
     * @return relative URL path, e.g.  /uploads/blogs/7/a1b2c3d4.jpg
     */
    public String storeBlogImage(Long postId, MultipartFile file) {
        validate(file);

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path blogDir = Paths.get(uploadDir, "blogs", String.valueOf(postId));
        try {
            Files.createDirectories(blogDir);
            Files.copy(file.getInputStream(),
                       blogDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored blog image {} for post {}", filename, postId);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store image for blog post " + postId + ": " + e.getMessage(), e);
        }

        return "/uploads/blogs/" + postId + "/" + filename;
    }

    /**
     * Delete every image on disk for a given blog post (entire sub-directory).
     */
    public void deleteAllBlogImages(Long postId) {
        Path blogDir = Paths.get(uploadDir, "blogs", String.valueOf(postId));
        if (!Files.exists(blogDir)) return;
        try (var stream = Files.walk(blogDir)) {
            stream.sorted(Comparator.reverseOrder())
                  .map(Path::toFile)
                  .forEach(f -> { if (!f.delete()) log.warn("Could not delete {}", f); });
            log.info("Deleted all image files for blog post {}", postId);
        } catch (IOException e) {
            log.warn("Error deleting image directory for blog post {}: {}", postId, e.getMessage());
        }
    }

    /**
     * Store a brochure (PDF/DOC) for a product.
     * Layout: uploads/brochures/{productId}/{uuid}.pdf
     * HTTP:   /uploads/brochures/{productId}/{uuid}.pdf
     */
    public String storeProductBrochure(Long productId, MultipartFile file) {
        validateBrochure(file);

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path brochureDir = Paths.get(uploadDir, "brochures", String.valueOf(productId));
        try {
            Files.createDirectories(brochureDir);
            Files.copy(file.getInputStream(),
                       brochureDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored brochure {} for product {}", filename, productId);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store brochure for product " + productId + ": " + e.getMessage(), e);
        }

        return "/uploads/brochures/" + productId + "/" + filename;
    }

    /**
     * Store an admin-uploaded image for a website content slot (Home, About,
     * header/footer logo, etc.) — grouped uniquely by page.
     * Layout: uploads/site/{page}/{uuid}.{ext}
     * HTTP:   /uploads/site/{page}/{uuid}.{ext}
     *
     * @param page logical page name, e.g. "home", "about", "header" (sanitized to a safe folder name)
     * @param file the uploaded MultipartFile
     * @return relative URL path, e.g. /uploads/site/about/3f4a5b6c7d8e.jpg
     */
    public String storeSiteImage(String page, MultipartFile file) {
        validate(file);

        String safePage = (page == null || page.isBlank())
                ? "misc"
                : page.toLowerCase().replaceAll("[^a-z0-9_-]", "-");

        String original  = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename()));
        String extension = getExtension(original);
        String filename  = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path siteDir = Paths.get(uploadDir, "site", safePage);
        try {
            Files.createDirectories(siteDir);
            Files.copy(file.getInputStream(),
                       siteDir.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored site image {} for page {}", filename, safePage);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store site image for page " + safePage + ": " + e.getMessage(), e);
        }

        return "/uploads/site/" + safePage + "/" + filename;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file must not be empty");
        }
        String ct = (file.getContentType() == null)
                ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_TYPES.contains(ct)) {
            throw new BadRequestException(
                    "Unsupported image type: \"" + ct + "\". Allowed: jpeg, png, webp, gif");
        }
        long maxBytes = maxFileSizeMb * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new BadRequestException(
                    "Image too large (" + (file.getSize() / 1024) + " KB). " +
                    "Maximum: " + maxFileSizeMb + " MB");
        }
    }

    private void validateBrochure(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Brochure file must not be empty");
        }
        String ct = (file.getContentType() == null)
                ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_BROCHURE_TYPES.contains(ct)) {
            throw new BadRequestException(
                    "Unsupported brochure type: \"" + ct + "\". Allowed: PDF, DOC, DOCX");
        }
        long maxBytes = 20L * 1024L * 1024L; // 20 MB max for brochures
        if (file.getSize() > maxBytes) {
            throw new BadRequestException(
                    "Brochure too large (" + (file.getSize() / 1024) + " KB). Maximum: 20 MB");
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) throw new BadRequestException("File has no extension: " + filename);
        return filename.substring(dot + 1).toLowerCase();
    }
}
