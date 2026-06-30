package com.yourbuildmart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Maps the URL prefix  /uploads/**  to the on-disk upload directory so that
 * stored product images can be fetched directly via HTTP, without a controller.
 *
 * FIX 1: resolves uploadDir to an absolute, normalised path at startup so
 *         the resource handler and FileStorageService always agree regardless
 *         of the JVM working directory.
 *
 * FIX 2: replaces the 1-hour browser cache with no-cache/must-revalidate so
 *         newly-uploaded files are visible immediately without a hard-refresh.
 *
 * FIX 3: adds CORS headers on /uploads/** so cross-origin image requests
 *         (e.g. React dev-server on :5173 loading images from :8080) never
 *         fail silently.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /** Canonical absolute path – call this instead of Paths.get(uploadDir) everywhere. */
    public Path resolvedUploadRoot() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = resolvedUploadRoot().toUri().toString();
        if (!location.endsWith("/")) location += "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                // No-cache so the browser always revalidates – prevents stale 404s
                // after a file is uploaded while an old "not found" is still cached.
                .setCacheControl(CacheControl.noCache().mustRevalidate())
                .resourceChain(false); // disable in-memory resource-chain cache in dev
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow any origin to load static uploads (images, PDFs, etc.)
        // This covers the React dev server (:5173) and any production domain.
        registry.addMapping("/uploads/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}

