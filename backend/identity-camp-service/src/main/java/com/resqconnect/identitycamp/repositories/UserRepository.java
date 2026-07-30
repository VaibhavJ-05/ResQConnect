package com.resqconnect.identitycamp.repositories;

import com.resqconnect.identitycamp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByRoleId(Integer roleId);
    List<User> findByRoleIdAndIsActiveTrue(Integer roleId);
}
