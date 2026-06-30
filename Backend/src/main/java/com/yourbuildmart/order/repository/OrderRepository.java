package com.yourbuildmart.order.repository;
import com.yourbuildmart.order.entity.Order; import com.yourbuildmart.user.entity.User;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUser(User user, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByStatus(Order.OrderStatus status);
}
