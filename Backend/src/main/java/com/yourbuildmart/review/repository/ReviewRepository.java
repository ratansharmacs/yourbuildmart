package com.yourbuildmart.review.repository;
import com.yourbuildmart.review.entity.Review;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndApprovedTrue(Long productId, Pageable pageable);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id=:pid AND r.approved=true")
    Double avgRating(@Param("pid") Long productId);
    long countByProductIdAndApprovedTrue(Long productId);
}
