package com.cloud.dev.entity;

import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "signalements", indexes = {
    @Index(name = "idx_statut", columnList = "statut"),
    @Index(name = "idx_user", columnList = "user_id"),
    @Index(name = "idx_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTravaux typeTravaux;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSignalement statut = StatutSignalement.NOUVEAU;
    
    // Géolocalisation
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    private String adresse;
    
    // Photos (URLs séparées par des virgules)
    @Column(length = 1000)
    private String photos;
    
    // Informations complémentaires pour le manager
    private Double surfaceM2;  // Surface en m²
    
    private Double budget;     // Budget estimé en Ariary
    
    private String entreprise; // Entreprise concernée
    
    // Utilisateur ayant créé le signalement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Synchronisation
    @Column(nullable = false)
    private Boolean synced = false;
    
    private String firebaseId;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime completedAt;
}
