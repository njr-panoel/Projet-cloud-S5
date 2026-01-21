package com.cloud.dev.repository;

import com.cloud.dev.entity.Session;
import com.cloud.dev.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    Optional<Session> findByToken(String token);
    
    List<Session> findByUser(User user);
    
    List<Session> findByUserAndActive(User user, Boolean active);
    
    @Query("SELECT s FROM Session s WHERE s.expiresAt < CURRENT_TIMESTAMP AND s.active = true")
    List<Session> findExpiredSessions();
    
    void deleteByUser(User user);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
