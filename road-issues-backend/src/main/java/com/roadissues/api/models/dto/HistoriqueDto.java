package com.roadissues.api.models.dto;

import lombok.*;

/**
 * DTO for historique response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueDto {
    private Long id;
    private Long signalementId;
    private Long managerId;
    private String managerNom;
    private String action;
    private String details;
    private String date;
}
