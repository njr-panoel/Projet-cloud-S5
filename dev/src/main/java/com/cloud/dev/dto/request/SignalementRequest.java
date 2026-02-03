package com.cloud.dev.dto.request;

import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementRequest {
    
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    
    private String description;
    
    @NotNull(message = "Le type de travaux est obligatoire")
    private TypeTravaux typeTravaux;
    
    private StatutSignalement statut;
    
    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;
    
    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;
    
    private String adresse;
    
    private String photos;  // URLs séparées par virgules
    
    private Double surfaceM2;  // Surface en m²
    
    private Double budget;     // Budget estimé en Ariary
    
    private String entreprise; // Entreprise concernée
    
    private String firebaseId;  // Pour synchronisation
}
