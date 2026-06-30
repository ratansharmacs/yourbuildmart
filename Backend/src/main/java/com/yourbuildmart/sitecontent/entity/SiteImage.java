package com.yourbuildmart.sitecontent.entity;

import com.yourbuildmart.common.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * A single admin-manageable image slot used somewhere on the public website
 * (e.g. the About page hero photo, a homepage category tile, the header logo).
 *
 * Each slot is uniquely identified by (page, slotKey):
 *   page     – logical page grouping, e.g. "home", "about", "header", "footer"
 *   slotKey  – stable identifier for the exact image within that page,
 *              e.g. "hero_banner", "category_aluminium", "logo"
 *
 * imageUrl holds either:
 *   - an admin-uploaded relative path  /uploads/site/{page}/{uuid}.jpg
 *   - or an arbitrary external URL the admin pasted in directly
 */
@Entity
@Table(name = "site_images", uniqueConstraints = {
        @UniqueConstraint(name = "uq_site_image_page_slot", columnNames = {"page", "slot_key"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String page;

    @Column(name = "slot_key", nullable = false, length = 100)
    private String slotKey;

    /** Human-readable name shown in the admin UI, e.g. "Hero banner image". */
    @Column(name = "label", length = 200)
    private String label;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;
}
