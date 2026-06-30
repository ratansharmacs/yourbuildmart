package com.yourbuildmart.admin.controller;

import com.yourbuildmart.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Admin endpoint to list, upload, and delete files from the uploads directory.
 * All uploaded files (products, categories, brands, blogs, brochures, etc.) are visible here.
 */
@Slf4j
@RestController
@RequestMapping("/admin/uploaded-files")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Uploaded Files", description = "List and manage all uploaded files")
public class UploadedFilesController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    // ─── List all files ───────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all uploaded files with metadata")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listFiles(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "newest") String sort) {

        Path root = Paths.get(uploadDir).toAbsolutePath();
        List<Map<String, Object>> result = new ArrayList<>();

        if (!Files.exists(root)) {
            return ResponseEntity.ok(ApiResponse.success("Files retrieved", result));
        }

        try (Stream<Path> walk = Files.walk(root)) {
            walk.filter(Files::isRegularFile)
                .forEach(path -> {
                    try {
                        String filename = path.getFileName().toString();
                        if (filename.startsWith(".")) return; // skip hidden

                        // relative URL path from root e.g. /uploads/products/1/abc.jpg
                        String relativePath = root.relativize(path).toString().replace("\\", "/");
                        String urlPath = "/uploads/" + relativePath;

                        long size = Files.size(path);
                        Instant lastModInst = Files.getLastModifiedTime(path).toInstant();
                        String lastMod = LocalDateTime.ofInstant(lastModInst, ZoneId.systemDefault()).format(FMT);

                        String ext = "";
                        int dot = filename.lastIndexOf('.');
                        if (dot >= 0) ext = filename.substring(dot + 1).toLowerCase();

                        // folder category e.g. "products", "brands", "blogs"
                        String category = "misc";
                        Path parent = root.relativize(path).getParent();
                        if (parent != null) {
                            String[] parts = parent.toString().replace("\\", "/").split("/");
                            if (parts.length > 0) category = parts[0];
                        }

                        Map<String, Object> info = new LinkedHashMap<>();
                        info.put("name", filename);
                        info.put("urlPath", urlPath);
                        info.put("category", category);
                        info.put("extension", ext);
                        info.put("sizeBytes", size);
                        info.put("lastModified", lastMod);
                        info.put("lastModifiedEpoch", lastModInst.toEpochMilli());
                        result.add(info);
                    } catch (IOException e) {
                        log.warn("Could not read file metadata: {}", path);
                    }
                });
        } catch (IOException e) {
            log.error("Error walking upload directory", e);
        }

        // Filter by search
        List<Map<String, Object>> filtered = result;
        if (!search.isBlank()) {
            String q = search.toLowerCase();
            filtered = result.stream()
                .filter(f -> ((String) f.get("name")).toLowerCase().contains(q)
                          || ((String) f.get("category")).toLowerCase().contains(q))
                .collect(Collectors.toList());
        }

        // Sort
        Comparator<Map<String, Object>> comparator;
        switch (sort) {
            case "oldest"  -> comparator = Comparator.comparingLong(f -> (long) f.get("lastModifiedEpoch"));
            case "name"    -> comparator = Comparator.comparing(f -> ((String) f.get("name")).toLowerCase());
            case "size"    -> comparator = Comparator.<Map<String, Object>, Long>comparing(f -> (long) f.get("sizeBytes")).reversed();
            default        -> comparator = Comparator.<Map<String, Object>, Long>comparing(f -> (long) f.get("lastModifiedEpoch")).reversed();
        }
        filtered.sort(comparator);

        return ResponseEntity.ok(ApiResponse.success("Files retrieved", filtered));
    }

    // ─── Upload a new file ────────────────────────────────────────────────────

    @PostMapping("/upload")
    @Operation(summary = "Upload a file to the uploads/brochures directory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("File must not be empty"));
        }

        String original = Objects.requireNonNull(file.getOriginalFilename())
                .replaceAll("[^a-zA-Z0-9._\\-]", "_");
        // Prevent overwrite: prefix with timestamp
        String filename = System.currentTimeMillis() + "_" + original;

        Path brochureDir = Paths.get(uploadDir, "brochures").toAbsolutePath();
        Files.createDirectories(brochureDir);

        Path dest = brochureDir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        log.info("Admin uploaded file: {}", dest);

        String urlPath = "/uploads/brochures/" + filename;
        String ext = "";
        int dot = filename.lastIndexOf('.');
        if (dot >= 0) ext = filename.substring(dot + 1).toLowerCase();

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("name", filename);
        info.put("urlPath", urlPath);
        info.put("category", "brochures");
        info.put("extension", ext);
        info.put("sizeBytes", Files.size(dest));
        info.put("lastModified", LocalDateTime.now().format(FMT));

        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", info));
    }

    // ─── Delete a file ────────────────────────────────────────────────────────

    @DeleteMapping
    @Operation(summary = "Delete a file by its URL path (e.g. /uploads/brochures/xyz.pdf)")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam String urlPath) {
        if (urlPath == null || !urlPath.startsWith("/uploads/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid file path"));
        }

        // Strip leading /uploads/ and resolve against upload dir
        String relative = urlPath.substring("/uploads/".length());
        Path target = Paths.get(uploadDir).toAbsolutePath().resolve(relative).normalize();
        Path root   = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Security: make sure we're not escaping the upload dir
        if (!target.startsWith(root)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Path traversal not allowed"));
        }

        try {
            boolean deleted = Files.deleteIfExists(target);
            if (deleted) {
                log.info("Admin deleted file: {}", target);
                return ResponseEntity.ok(ApiResponse.success("File deleted"));
            } else {
                return ResponseEntity.ok(ApiResponse.success("File not found, nothing deleted"));
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", target, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Could not delete file: " + e.getMessage()));
        }
    }
}
