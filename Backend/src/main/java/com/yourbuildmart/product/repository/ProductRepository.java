package com.yourbuildmart.product.repository;
import com.yourbuildmart.product.entity.Product;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
    @Query("SELECT p FROM Product p WHERE p.active=true AND LOWER(p.brand) = LOWER(:brand)")
    Page<Product> findByBrandIgnoreCaseAndActiveTrue(@Param("brand") String brand, Pageable pageable);
    Page<Product> findByFeaturedTrueAndActiveTrue(Pageable pageable);
    @Query("SELECT p FROM Product p WHERE p.active=true AND (LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Product> search(@Param("q") String q, Pageable pageable);
    Optional<Product> findByIdAndActiveTrue(Long id);
    boolean existsBySku(String sku);
    long countByActiveTrue();

    // For dashboard charts
    @Query("SELECT p.category.name, COUNT(p), COALESCE(SUM(p.stock),0) FROM Product p WHERE p.active=true GROUP BY p.category.name ORDER BY COUNT(p) DESC")
    List<Object[]> findCategoryStats();

    @Query("SELECT p FROM Product p WHERE p.active=true ORDER BY p.createdAt DESC")
    List<Product> findTop12ByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    long countBySellerIsNotNull();
    long countBySellerIsNull();
}
