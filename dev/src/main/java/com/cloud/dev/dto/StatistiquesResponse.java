package com.cloud.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesResponse {
    
    // Comptages par statut
    private Long totalSignalements;
    private Long nouveaux;
    private Long enCours;
    private Long termines;
    private Long annules;
    
    // Délais moyens en jours
    private Double delaiMoyenTraitement;         // De NOUVEAU à TERMINE
    private Double delaiMoyenPriseEnCharge;      // De NOUVEAU à EN_COURS
    
    // Statistiques par type de travaux
    private Map<String, Long> parTypeTravaux;
    
    // Avancement global (moyenne de tous les signalements non annulés)
    private Double avancementMoyen;
    
    // Délai min/max de traitement
    private Long delaiMinTraitement;
    private Long delaiMaxTraitement;
    
    // Budget total
    private Double budgetTotal;
    private Double budgetTermine;
    private Double budgetEnCours;
}
