package com.yourbuildmart.notification.repository;
import com.yourbuildmart.notification.entity.Notification; import com.yourbuildmart.user.entity.User;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUser(User user, Pageable pageable);
    long countByUserAndReadFalse(User user);
}
