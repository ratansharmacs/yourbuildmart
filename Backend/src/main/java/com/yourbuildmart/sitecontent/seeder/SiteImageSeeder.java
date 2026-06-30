package com.yourbuildmart.sitecontent.seeder;

import com.yourbuildmart.sitecontent.entity.SiteImage;
import com.yourbuildmart.sitecontent.repository.SiteImageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the {@code site_images} table with every image slot used across the
 * public website, defaulted to the URL that was previously hardcoded in the
 * frontend source. Runs once per slot — idempotent (skips any slot that
 * already exists), so admin edits are never overwritten on restart, and any
 * new slot added in a future release is picked up automatically.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SiteImageSeeder {

    private static final String BASE = "https://yourbuildmart.com/public";

    private final SiteImageRepository siteImageRepository;

    @PostConstruct
    public void seed() {
        List<SiteImage> defaults = List.of(
            // ── Header / Footer ──────────────────────────────────────────
            slot("header", "logo", "Site logo (header)", BASE + "/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png"),
            slot("footer", "logo", "Site logo (footer)", BASE + "/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png"),

            // ── Home page ─────────────────────────────────────────────────
            slot("home", "category_steel",       "Category tile — Steel Bars",        BASE + "/assets/img/steel__bars.jpg"),
            slot("home", "category_peb",          "Category tile — PEB Structure",     BASE + "/assets/img/peb-st.jpg"),
            slot("home", "category_false_ceiling","Category tile — False Ceiling",     BASE + "/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg"),
            slot("home", "category_electrical",   "Category tile — Electrical",        BASE + "/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg"),
            slot("home", "category_aluminium",    "Category tile — Aluminium Products",BASE + "/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png"),
            slot("home", "category_fire_fighting","Category tile — Fire Fighting",     BASE + "/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg"),
            slot("home", "category_valves",       "Category tile — Industrial Valves", BASE + "/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg"),
            slot("home", "why_us_shipping",       "Why Us — Global Shipping icon",     BASE + "/assets/img/shipping.jpg"),
            slot("home", "why_us_customer",       "Why Us — Customer Support icon",    BASE + "/assets/img/customer.jpg"),
            slot("home", "why_us_iso",            "Why Us — ISO Certification icon",   BASE + "/assets/img/iso-certifiaction.jpg"),
            slot("home", "why_us_delivery",       "Why Us — Express Delivery icon",    BASE + "/assets/img/express-delivery.jpg"),
            slot("home", "why_us_bestproduct",    "Why Us — Best Product icon",        BASE + "/assets/img/bestproduct.jpg"),
            slot("home", "brand_abb",             "Brand strip logo — ABB",            BASE + "/assets/img/abb.png"),
            slot("home", "brand_hindalco",        "Brand strip logo — Hindalco",       BASE + "/assets/img/hindalco.png"),
            slot("home", "brand_jindal",          "Brand strip logo — Jindal",         BASE + "/assets/img/jindal.png"),
            slot("home", "brand_jsw",             "Brand strip logo — JSW",            BASE + "/assets/img/jsw.png"),
            slot("home", "brand_gyproc",          "Brand strip logo — Gyproc",         BASE + "/assets/img/gyproc.png"),
            slot("home", "brand_havells",         "Brand strip logo — Havells",        BASE + "/assets/img/hevels.png"),
            slot("home", "brand_supreme",         "Brand strip logo — Supreme",        BASE + "/assets/img/supreme.png"),
            slot("home", "brand_smc",             "Brand strip logo — SMC",            BASE + "/assets/img/smc.png"),
            slot("home", "agent_program_banner",  "Agent Program banner image",        BASE + "/assets/img/register-your.jpg"),

            // ── About page ────────────────────────────────────────────────
            slot("about", "hero_image",          "Hero — About YourBuildMart photo",   BASE + "/assets/img/about-ybm.jpg"),
            slot("about", "values_image",        "Our Values photo",                   BASE + "/assets/img/join-the-team.jpg"),
            slot("about", "category_aluminium",  "Category tile — Aluminium Products", BASE + "/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png"),
            slot("about", "category_electrical", "Category tile — Electrical Products",BASE + "/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg"),
            slot("about", "category_false_ceiling","Category tile — False Ceiling",    BASE + "/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg"),
            slot("about", "category_fire_fighting","Category tile — Fire Fighting",    BASE + "/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg"),
            slot("about", "category_valves",     "Category tile — Industrial Valves",  BASE + "/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg"),
            slot("about", "category_peb",        "Category tile — PEB Structure",      BASE + "/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg"),
            slot("about", "partner_bpl",         "Partner logo — BPL",                 BASE + "/assets/img/BPL.png"),
            slot("about", "partner_aai",         "Partner logo — AAI",                 BASE + "/assets/img/AAI.png"),
            slot("about", "partner_irites",      "Partner logo — IRITES",              BASE + "/assets/img/irites.png"),
            slot("about", "partner_dpworld",     "Partner logo — DP World",            BASE + "/assets/img/DP_world.png"),
            slot("about", "partner_cfcl",        "Partner logo — CFCL",                BASE + "/assets/img/CFCL.png"),
            slot("about", "partner_iol",         "Partner logo — IOL",                 BASE + "/assets/img/IOL.png"),
            slot("about", "partner_dlf",         "Partner logo — DLF",                 BASE + "/assets/img/DLF.png"),
            slot("about", "partner_nha",         "Partner logo — NHA",                 BASE + "/assets/img/NHA.png"),
            slot("about", "sustainable_image",   "Sustainability section photo",       BASE + "/assets/img/sustainable.jpg"),
            slot("about", "customer_image",      "Customer focus section photo",       BASE + "/assets/img/costomer.jpg"),

            // ── Quality Assurance page ───────────────────────────────────
            slot("quality-assurance", "quality_image",      "Quality section photo",      BASE + "/assets/img/quality.jpg"),
            slot("quality-assurance", "sustainability_image","Sustainability section photo",BASE + "/assets/img/sustainbility.jpg")
        );

        int created = 0;
        for (SiteImage candidate : defaults) {
            boolean exists = siteImageRepository
                    .findByPageAndSlotKey(candidate.getPage(), candidate.getSlotKey())
                    .isPresent();
            if (!exists) {
                siteImageRepository.save(candidate);
                created++;
            }
        }
        if (created > 0) {
            log.info("[SITE-IMAGE-SEEDER] ✔ Seeded {} new image slot(s)", created);
        }
    }

    private SiteImage slot(String page, String key, String label, String defaultUrl) {
        return SiteImage.builder()
                .page(page)
                .slotKey(key)
                .label(label)
                .imageUrl(defaultUrl)
                .build();
    }
}
