package com.yourbuildmart.product.migration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Idempotent schema migration — safe to run on every restart.
 *
 * v45: makes products.price nullable so the admin can leave price unset
 * ("Price on request" products) without being forced to enter a value.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductSchemaMigration {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void migrate() {
        log.info("[DB-MIGRATION] ▶ Starting product schema migration...");
        makeColumnNullable("products", "price", "DECIMAL(12,2)");
        log.info("[DB-MIGRATION] ✅ Product schema migration complete.");
    }

    private void makeColumnNullable(String table, String column, String type) {
        try {
            Boolean nullable = jdbc.queryForObject(
                "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                (rs, rowNum) -> "YES".equalsIgnoreCase(rs.getString(1)), table, column);

            if (Boolean.TRUE.equals(nullable)) {
                log.debug("[DB-MIGRATION]   Skip nullable {}.{} (already nullable)", table, column);
                return;
            }
            jdbc.execute("ALTER TABLE `" + table + "` MODIFY COLUMN `" + column + "` " + type + " NULL");
            log.info("[DB-MIGRATION] ✔ Made nullable {}.{}", table, column);
        } catch (Exception e) {
            log.warn("[DB-MIGRATION] ⚠ Could not make {}.{} nullable — {}", table, column, e.getMessage());
        }
    }
}
