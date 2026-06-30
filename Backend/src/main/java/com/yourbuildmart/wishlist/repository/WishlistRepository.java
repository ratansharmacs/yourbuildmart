package com.yourbuildmart.wishlist.repository;
import com.yourbuildmart.wishlist.entity.Wishlist; import com.yourbuildmart.user.entity.User;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    /** Fetch only wishlist entries whose product is still active */
    @org.springframework.data.jpa.repository.Query(
        "SELECT w FROM Wishlist w JOIN FETCH w.product p WHERE w.user = :user AND p.active = true")
    Page<Wishlist> findByUserAndProductActive(
            @org.springframework.data.repository.query.Param("user") User user,
            Pageable pageable);

    /** Used for the full list (with inactive) when we need to clean stale entries */
    Page<Wishlist> findByUser(User user, Pageable pageable);

    Optional<Wishlist> findByUserAndProductId(User user, Long productId);
    boolean existsByUserAndProductId(User user, Long productId);
    void deleteByUserAndProductId(User user, Long productId);

    /** Bulk-remove all wishlist entries pointing at a now-deleted/deactivated product */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "DELETE FROM Wishlist w WHERE w.product.id = :productId")
    void deleteAllByProductId(
            @org.springframework.data.repository.query.Param("productId") Long productId);
}
