package com.yourbuildmart.cart.repository;
import com.yourbuildmart.cart.entity.Cart; import com.yourbuildmart.cart.entity.CartItem;
import com.yourbuildmart.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    void deleteByCart(Cart cart);
}
