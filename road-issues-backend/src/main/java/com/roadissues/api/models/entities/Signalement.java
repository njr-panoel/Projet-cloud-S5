package com.roadissues.api.models.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Signalement (Report) entity for road issues.
 * Tracks location, status, and resolution details.
 */
@Entity
@Table(name = "signalements", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_statut", columnList = "statut"),
    @Index(name = "idx_date_creation", columnList = "date_creation"),
    @Index(name = "idx_coordinates", columnList = "latitude, longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SignalementStatut statut = SignalementStatut.NOUVEAU;
    
    @Column(name = "surface_m2")
    private Double surfaceM2;
    
    @Column(nullable = false)
    @Builder.Default
    private Double budget = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private String entreprise = "";
    
    @Column(name = "date_creation", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Column(name = "date_update")
    @Builder.Default
    private LocalDateTime dateUpdate = LocalDateTime.now();
    
    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;
    
    @Column(name = "sync_timestamp")
    @Builder.Default
    private Long syncTimestamp = System.currentTimeMillis();
    
    @PreUpdate
    protected void onUpdate() {
        dateUpdate = LocalDateTime.now();
        syncTimestamp = System.currentTimeMillis();
    }
}
