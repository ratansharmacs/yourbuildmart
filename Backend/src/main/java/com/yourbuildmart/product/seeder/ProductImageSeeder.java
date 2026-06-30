package com.yourbuildmart.product.seeder;

import com.yourbuildmart.product.entity.Product;
import com.yourbuildmart.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * On startup, links the 7 newly-uploaded product images to the correct products
 * in the database by updating their additionalImages list.
 *
 * This seeder is safe: every operation is wrapped in try-catch so a missing product
 * or any DB issue will never prevent application startup.
 *
 * Image paths stored here match:
 *   Backend  → uploads/products/{id}/filename  (served via /uploads/**)
 *   Frontend → src/assets/uploads/products/filename  (local dev asset)
 */
@Slf4j
@Component
@Order(30)
@RequiredArgsConstructor
public class ProductImageSeeder implements ApplicationRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(ApplicationArguments args) {
        try {
            updateProductImages();
        } catch (Exception e) {
            // Never block startup
            log.warn("ProductImageSeeder encountered an error (non-fatal): {}", e.getMessage());
        }
    }

    private void updateProductImages() {
        // --- Steel Sheet: update images with the 3 uploaded photos ---
        productRepository.findAll().stream()
            .filter(p -> p.getName() != null &&
                         p.getName().toLowerCase().contains("steel sheet") &&
                         (p.getAdditionalImages() == null || p.getAdditionalImages().isEmpty()))
            .findFirst()
            .ifPresent(p -> {
                if (p.getImageUrl() == null || p.getImageUrl().isBlank()) {
                    p.setImageUrl("/uploads/products/steel_sheet_1.jpg");
                }
                p.setAdditionalImages(List.of(
                    "/uploads/products/steel_sheet_1.jpg",
                    "/uploads/products/steel_sheet_2.jpg",
                    "/uploads/products/steel_sheet_3.jpg"
                ));
                productRepository.save(p);
                log.info("ProductImageSeeder: linked 3 steel sheet images to product id={}", p.getId());
            });

        // --- Butterfly Valves: update images with the 4 uploaded photos ---
        productRepository.findAll().stream()
            .filter(p -> p.getName() != null &&
                         p.getName().toLowerCase().contains("butterfly") &&
                         (p.getAdditionalImages() == null || p.getAdditionalImages().isEmpty()))
            .findFirst()
            .ifPresent(p -> {
                if (p.getImageUrl() == null || p.getImageUrl().isBlank()) {
                    p.setImageUrl("/uploads/products/butterfly_valve_1.png");
                }
                p.setAdditionalImages(List.of(
                    "/uploads/products/butterfly_valve_1.png",
                    "/uploads/products/butterfly_valve_2.png",
                    "/uploads/products/butterfly_valve_3.png",
                    "/uploads/products/butterfly_valve_4.png"
                ));
                productRepository.save(p);
                log.info("ProductImageSeeder: linked 4 butterfly valve images to product id={}", p.getId());
            });
    }
}
