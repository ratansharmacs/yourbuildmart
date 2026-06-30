package com.yourbuildmart.order.migration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Idempotent schema migration — safe to run on every restart.
 *
 * v18: removed stale price/payment/address columns, added enquiry columns.
 * v20: re-adds payment_status, total_amount, tracking and delivery fields.
 *
 * Every step checks column existence first so it never fails on a clean DB
 * or one that already has the column from a previous restart.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderItemSchemaMigration {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void migrate() {
        log.info("[DB-MIGRATION] ▶ Starting schema migration...");

        // ── orders: stale columns from very old schema (drop once, idempotent) ──
        dropColumnIfExists("orders", "subtotal");
        dropColumnIfExists("orders", "shipping_charge");
        dropColumnIfExists("orders", "discount");
        dropColumnIfExists("orders", "payment_method");
        dropColumnIfExists("orders", "shipping_address_id");
        dropColumnIfExists("orders", "notes");

        // ── orders: v18 enquiry columns ───────────────────────────────────────
        addColumnIfAbsent("orders", "enquiry_name",         "VARCHAR(255)");
        addColumnIfAbsent("orders", "enquiry_email",        "VARCHAR(255)");
        addColumnIfAbsent("orders", "enquiry_organization", "VARCHAR(255)");
        addColumnIfAbsent("orders", "enquiry_country",      "VARCHAR(255)");
        addColumnIfAbsent("orders", "enquiry_text",         "TEXT");

        // ── orders: v20 admin delivery + payment columns ──────────────────────
        addColumnIfAbsent("orders", "payment_status",   "VARCHAR(20) NOT NULL DEFAULT 'UN_PAID'");
        addColumnIfAbsent("orders", "delivery_partner", "VARCHAR(100)");
        addColumnIfAbsent("orders", "tracking_id",      "VARCHAR(100)");
        addColumnIfAbsent("orders", "tracking_url",     "TEXT");
        addColumnIfAbsent("orders", "total_amount",     "DECIMAL(12,2)");

        // ── order_items: v20 price snapshot ───────────────────────────────────
        addColumnIfAbsent("order_items", "price", "DECIMAL(12,2)");

        log.info("[DB-MIGRATION] ✅ Schema migration complete.");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void dropColumnIfExists(String table, String column) {
        if (columnExists(table, column)) {
            try {
                jdbc.execute("ALTER TABLE `" + table + "` DROP COLUMN `" + column + "`");
                log.info("[DB-MIGRATION] ✔ Dropped   {}.{}", table, column);
            } catch (Exception e) {
                log.warn("[DB-MIGRATION] ⚠ Drop failed {}.{} — {}", table, column, e.getMessage());
            }
        } else {
            log.debug("[DB-MIGRATION]   Skip drop  {}.{} (not present)", table, column);
        }
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
