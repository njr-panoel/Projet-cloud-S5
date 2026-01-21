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
    private UserResponse user;
    private Boolean synced;
    private String firebaseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
