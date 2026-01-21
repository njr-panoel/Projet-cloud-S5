package com.roadissues.api.repositories;

import com.roadissues.api.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity persistence operations
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by Firebase UID
     */
    Optional<User> findByFirebaseUid(String firebaseUid);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
}
