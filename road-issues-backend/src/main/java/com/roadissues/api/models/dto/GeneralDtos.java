package com.roadissues.api.models.dto;

import lombok.*;

/**
 * DTO for stats response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class StatsDtoLegacy {
    private Long nbPoints;
    private Double totalSurfaceM2;
    private Double avancementPercent;
    private Double totalBudget;
    private Long nbNouveau;
    private Long nbEnCours;
    private Long nbTermine;
}

/**
 * DTO for sync request
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SyncRequestLegacy {
    private java.util.List<SignalementSyncDto> signalements;
    private Long lastSyncTimestamp;
}

/**
 * DTO for signalement sync
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SignalementSyncDtoLegacy {
    private Long id;
    private Double latitude;
    private Double longitude;
    private String description;
    private String photoUrl;
    private String statut;
    private Double surfaceM2;
    private Double budget;
    private String entreprise;
    private Long syncTimestamp;
}

/**
 * DTO for sync response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SyncResponseLegacy {
    private java.util.List<SignalementSyncDto> updates;
    private Long syncTimestamp;
}
