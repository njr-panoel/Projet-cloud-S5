package com.cloud.dev.repository;

import com.cloud.dev.entity.User;
import com.cloud.dev.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByFirebaseUid(String firebaseUid);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByFirebaseUid(String firebaseUid);
    
    List<User> findByRole(Role role);
    
    List<User> findByAccountLocked(Boolean locked);
    
    @Query("SELECT u FROM User u WHERE u.accountLocked = true AND u.lockedUntil < CURRENT_TIMESTAMP")
    List<User> findExpiredLockedAccounts();
}
