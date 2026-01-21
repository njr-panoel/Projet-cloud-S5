package com.roadissues.api.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for signalement response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementDto {
    private Long id;
    private Long userId;
    private String nomUtilisateur;
    private Double latitude;
    private Double longitude;
    private String description;
    private String photoUrl;
    private String statut;
    private Double surfaceM2;
    private Double budget;
    private String entreprise;
    private String dateCreation;
    private String dateUpdate;
}
