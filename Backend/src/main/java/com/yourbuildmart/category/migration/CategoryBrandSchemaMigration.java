package com.yourbuildmart.category.migration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Idempotent schema migration — safe to run on every restart.
 *
 * Adds the admin-panel fields for Categories (icon, meta title/description,
 * slug, order level, type, featured, commission) and Brands (meta title/
 * description, slug).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryBrandSchemaMigration {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void migrate() {
        log.info("[DB-MIGRATION] ▶ Starting category/brand schema migration...");

        // ── categories ──────────────────────────────────────────────────────
        addColumnIfAbsent("categories", "icon_url",         "VARCHAR(512)");
        addColumnIfAbsent("categories", "meta_title",       "VARCHAR(255)");
        addColumnIfAbsent("categories", "meta_description", "TEXT");
        addColumnIfAbsent("categories", "slug",             "VARCHAR(255)");
        addColumnIfAbsent("categories", "order_level",      "INT NOT NULL DEFAULT 0");
        addColumnIfAbsent("categories", "category_type",    "VARCHAR(50) NOT NULL DEFAULT 'Physical'");
        addColumnIfAbsent("categories", "featured",         "BOOLEAN NOT NULL DEFAULT FALSE");
        addColumnIfAbsent("categories", "commission",       "DOUBLE DEFAULT 0");

        // ── brands ───────────────────────────────────────────────────────────
        addColumnIfAbsent("brands", "meta_title",       "VARCHAR(255)");
        addColumnIfAbsent("brands", "meta_description", "TEXT");
        addColumnIfAbsent("brands", "slug",             "VARCHAR(255)");

        log.info("[DB-MIGRATION] ✅ Category/brand schema migration complete.");
    }

    private void addColumnIfAbsent(String table, String column, String definition) {
        if (!columnExists(table, column)) {
            try {
                jdbc.execute("ALTER TABLE `" + table + "` ADD COLUMN `" + column + "` " + definition);
                log.info("[DB-MIGRATION] ✔ Added     {}.{} {}", table, column, definition);
            } catch (Exception e) {
                log.warn("[DB-MIGRATION] ⚠ Add failed {}.{} — {}", table, column, e.getMessage());
            }
        } else {
            log.debug("[DB-MIGRATION]   Skip add   {}.{} (already present)", table, column);
        }
    }

    private boolean columnExists(String table, String column) {
        try {
            Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class, table, column);
            return count != null && count > 0;
        } catch (Exception e) {
            log.warn("[DB-MIGRATION] ⚠ Cannot check {}.{} — {}", table, column, e.getMessage());
            return false;
        }
    }
}
