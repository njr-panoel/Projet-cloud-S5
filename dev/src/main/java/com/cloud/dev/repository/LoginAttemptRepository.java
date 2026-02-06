package com.cloud.dev.repository;

import com.cloud.dev.entity.LoginAttempt;
import com.cloud.dev.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    
    List<LoginAttempt> findByUserOrderByAttemptedAtDesc(User user);
    
    List<LoginAttempt> findByUserAndSuccessFalseOrderByAttemptedAtDesc(User user);
    
    @Query("SELECT la FROM LoginAttempt la WHERE la.user = :user AND la.success = false AND la.attemptedAt > :since ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findRecentFailedAttempts(@Param("user") User user, @Param("since") LocalDateTime since);
    
    @Query("SELECT la FROM LoginAttempt la WHERE la.user.id = :userId ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findByUserId(@Param("userId") Long userId);
    
    void deleteByUser(User user);
}
