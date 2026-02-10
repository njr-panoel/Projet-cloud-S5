package com.cloud.dev.dto.response;

import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementResponse {
    private Long id;
    private String titre;
    private String description;
    private TypeTravaux typeTravaux;
    private StatutSignalement statut;
    private Double latitude;
    private Double longitude;
    private String adresse;
    private String photos;
    private Double surfaceM2;
    private Double budget;
    private String entreprise;
    private UserResponse user;
    private Boolean synced;
    private String firebaseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    
    // Dates de suivi d'avancement
    private LocalDateTime dateNouveau;
    private LocalDateTime dateEnCours;
    private LocalDateTime dateTermine;
    
    // Avancement calculé (0%, 50%, 100%)
    private Integer avancement;
    
    // Délais en jours
    private Long delaiTraitementJours;      // Nouveau → Terminé
    private Long delaiPriseEnChargeJours;   // Nouveau → En cours
}
