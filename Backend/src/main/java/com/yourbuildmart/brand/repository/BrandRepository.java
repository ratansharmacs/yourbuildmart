package com.yourbuildmart.brand.repository;

import com.yourbuildmart.brand.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByName(String name);
    boolean existsByName(String name);
}
