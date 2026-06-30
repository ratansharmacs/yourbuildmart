package com.yourbuildmart.brand.seeder;

import com.yourbuildmart.brand.entity.Brand;
import com.yourbuildmart.brand.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the brands table with all brands from the YourBuildMart catalogue.
 * Runs once: skips entirely if any brand row already exists.
 * Wrapped in try-catch so a DB hiccup never blocks application startup.
 */
@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
public class BrandSeeder implements ApplicationRunner {

    private final BrandRepository brandRepository;

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (brandRepository.count() > 0) {
                log.info("BrandSeeder: brands already present, skipping.");
                return;
            }
            seedBrands();
        } catch (Exception e) {
            log.warn("BrandSeeder encountered an error (non-fatal): {}", e.getMessage());
        }
    }

    private void seedBrands() {
        final String CDN = "https://yourbuildmart.com/public/uploads/all/";
        final String BASE = "https://yourbuildmart.com/brand/";

        List<Brand> brands = List.of(
            b("ABB",
              CDN + "U3vHSo6epE3ARS5X8EwltXTJWEQgeJGIwiOAxoRS.png",
              BASE + "abb"),
            b("China Hongqiao Group Limited",
              CDN + "mfahTdlfjR8vvyGolhF8aaUKshBqVzPCkXo8sz77.png",
              BASE + "china-hongqiao-group-limited"),
            b("Foshan Shenghai Aluminium",
              CDN + "H1vp8BGwbjz8O6LrBhGM7Xj71sFtvQyMxghdS54p.jpg",
              BASE + "foshan-shenghai-aluminium"),
            b("Gyproc",
              CDN + "7u4hCVub6qswOZ6LmYOtLyLOe65p1QPhNzucDBxY.png",
              BASE + "Gyproc-12MLZ"),
            b("Havells",
              CDN + "pqPKFk4BNaQpi9vLGzkWjnOc3Qw1QY8hTjV28E79.png",
              BASE + "Havells-MeYuo"),
            b("Hindalco",
              "https://yourbuildmart.com/public/assets/img/hindalco.png",
              BASE + "Hindalco-1PNCD"),
            b("Jindal Aluminum",
              "https://yourbuildmart.com/public/assets/img/jindal.png",
              BASE + "Jindal-Aluminum-OQBw1"),
            b("Jindal Steel",
              "https://yourbuildmart.com/public/assets/img/jindal.png",
              BASE + "Jindal-Steel-07ec0"),
            b("JSW Steel",
              "https://yourbuildmart.com/public/assets/img/jsw.png",
              BASE + "JSW-Steel-jdlOa"),
            b("Larsen & Toubro",
              CDN + "LwXhCzBLJCdXvipjCeSfoE0i9iL7jNK2Y0KkDd3l.png",
              BASE + "Larsen--Toubro-zjoxT"),
            b("Lesso",
              CDN + "hIlwDoF53qyzUkYzrF9QjbcFcmJ5yzkDCtSWFNpP.jpg",
              BASE + "Lesso-g3Nvo"),
            b("Octal Corporation",
              CDN + "hIlwDoF53qyzUkYzrF9QjbcFcmJ5yzkDCtSWFNpP.jpg",
              BASE + "Octal-Corporation-L12c5"),
            b("Shanghai Metal Corporation",
              CDN + "LwXhCzBLJCdXvipjCeSfoE0i9iL7jNK2Y0KkDd3l.png",
              BASE + "Shanghai-Metal-Corporation-SMC-LHeRH"),
            b("Steel Authority of India (SAIL)",
              CDN + "9fPVZFXDHJKh2whj7wG7wYLCBxXvtr7aSPxejY1u.png",
              BASE + "steel-authortiy-of-india"),
            b("Supreme PVC and Steel Pipe Corp",
              "https://yourbuildmart.com/public/assets/img/supreme.png",
              BASE + "Supreme-PVC-and-Steel-Pipe-Corp-a8LdZ"),
            b("TPMC Steel",
              CDN + "AGLZdUVO1cQuLcDCCkSh1sFbfnkwcAeLFXR58rrh.jpg",
              BASE + "TPMC-Steel-zVSI1")
        );

        brandRepository.saveAll(brands);
        log.info("BrandSeeder: seeded {} brands.", brands.size());
    }

    private Brand b(String name, String imageUrl, String href) {
        return Brand.builder()
                .name(name)
                .imageUrl(imageUrl)
                .href(href)
                .active(true)
                .build();
    }
}
