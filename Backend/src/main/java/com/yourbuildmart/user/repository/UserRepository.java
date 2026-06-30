package com.yourbuildmart.user.repository;

import com.yourbuildmart.user.entity.Role;
import com.yourbuildmart.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndEmailNot(String phone, String email);
    Page<User> findByRole(Role role, Pageable pageable);
    long countByRole(Role role);
    long countByRoleAndActiveTrue(Role role);
}
