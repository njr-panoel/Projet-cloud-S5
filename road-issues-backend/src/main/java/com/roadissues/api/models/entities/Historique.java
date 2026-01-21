package com.roadissues.api.models.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Historique entity for tracking changes to signalements.
 * Records all manager actions and status changes.
 */
@Entity
@Table(name = "historiques", indexes = {
    @Index(name = "idx_signalement_id", columnList = "signalement_id"),
    @Index(name = "idx_manager_id", columnList = "manager_id"),
    @Index(name = "idx_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Historique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id", nullable = false)
    private Signalement signalement;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String action;
    
    @Column(name = "date", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime date = LocalDateTime.now();
    
    @Column(columnDefinition = "TEXT")
    private String details;
}
