package com.roadissues.api.models.dto;

import lombok.*;
import jakarta.validation.constraints.*;

/**
 * DTO for creating a signalement
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class CreateSignalementRequestLegacy {
    
    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Invalid latitude")
    @Max(value = 90, message = "Invalid latitude")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Invalid longitude")
    @Max(value = 180, message = "Invalid longitude")
    private Double longitude;
    
    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;
    
    private String photoUrl;
}

/**
 * DTO for updating signalement status and details (manager only)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UpdateSignalementRequestLegacy {
    
    private String statut;
    
    @Min(value = 0)
    private Double surfaceM2;
    
    @Min(value = 0)
    private Double budget;
    
    private String entreprise;
}

/**
 * DTO for signalement response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SignalementDtoLegacy {
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
