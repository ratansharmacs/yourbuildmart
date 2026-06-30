package com.yourbuildmart.address.repository;
import com.yourbuildmart.address.entity.Address; import com.yourbuildmart.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; import java.util.Optional;
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    Optional<Address> findByUserAndIsDefaultTrue(User user);
}
