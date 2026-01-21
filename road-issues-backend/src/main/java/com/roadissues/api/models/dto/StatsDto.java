package com.roadissues.api.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for stats response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsDto {
    private Long nbPoints;
    private Double totalSurfaceM2;
    private Double avancementPercent;
    private Double totalBudget;
    private Long nbNouveau;
    private Long nbEnCours;
    private Long nbTermine;
}
