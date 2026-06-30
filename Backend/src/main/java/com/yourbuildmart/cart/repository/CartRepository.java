package com.yourbuildmart.cart.repository;
import com.yourbuildmart.cart.entity.Cart; import com.yourbuildmart.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
