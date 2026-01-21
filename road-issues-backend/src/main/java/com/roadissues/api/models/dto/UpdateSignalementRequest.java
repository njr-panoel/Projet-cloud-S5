package com.roadissues.api.models.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for updating signalement status and details (manager only)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSignalementRequest {

    private String statut;

    @Min(value = 0)
    private Double surfaceM2;

    @Min(value = 0)
    private Double budget;

    private String entreprise;
}
