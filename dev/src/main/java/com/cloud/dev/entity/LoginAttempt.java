package com.cloud.dev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempts", indexes = {
    @Index(name = "idx_login_attempt_user", columnList = "user_id"),
    @Index(name = "idx_login_attempt_date", columnList = "attemptedAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String ipAddress;
    
    private String userAgent;
    
    @Column(nullable = false)
    private Boolean success = false;
    
    private String failureReason;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime attemptedAt;
}
