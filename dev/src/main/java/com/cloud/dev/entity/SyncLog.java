package com.cloud.dev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String entityType;  // User, Signalement
    
    @Column(nullable = false)
    private Long entityId;
    
    @Column(nullable = false)
    private String action;  // CREATE, UPDATE, DELETE
    
    private String firebaseId;
    
    @Column(nullable = false)
    private Boolean success;
    
    @Column(length = 1000)
    private String errorMessage;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime syncedAt;
}
