package com.cloud.dev.entity;

import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_firebase_uid", columnList = "firebaseUid")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false)
    private String prenom;
    
    private String telephone;
    
    // Mot de passe hashé (pour auth locale uniquement)
    private String password;
    
    // UID Firebase (si auth Firebase)
    @Column(unique = true)
    private String firebaseUid;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.VISITEUR;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean accountLocked = false;
    
    private LocalDateTime lockedUntil;
    
    @Column(nullable = false)
    private Integer loginAttempts = 0;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastLoginAt;
}
