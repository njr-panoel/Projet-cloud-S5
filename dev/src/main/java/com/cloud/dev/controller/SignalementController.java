package com.cloud.dev.controller;

import com.cloud.dev.dto.request.SignalementRequest;
import com.cloud.dev.dto.response.ApiResponse;
import com.cloud.dev.dto.response.SignalementResponse;
import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import com.cloud.dev.service.SignalementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Signalements", description = "Gestion des signalements de travaux routiers")
@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
public class SignalementController {
    
    private final SignalementService signalementService;
    
    @Operation(summary = "Créer un nouveau signalement")
    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<SignalementResponse>> createSignalement(
            @Valid @RequestBody SignalementRequest request,
            Authentication authentication) {
        SignalementResponse response = signalementService.createSignalement(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Signalement créé avec succès", response));
    }
    
    @Operation(summary = "Obtenir tous les signalements (Public)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SignalementResponse>>> getAllSignalements() {
        List<SignalementResponse> signalements = signalementService.getAllSignalements();
        return ResponseEntity.ok(ApiResponse.success(signalements));
    }
    
    @Operation(summary = "Obtenir un signalement par ID (Public)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SignalementResponse>> getSignalementById(@PathVariable Long id) {
        SignalementResponse signalement = signalementService.getSignalementById(id);
        return ResponseEntity.ok(ApiResponse.success(signalement));
    }
    
    @Operation(summary = "Obtenir les signalements par statut")
    @GetMapping("/statut/{statut}")
    public ResponseEntity<ApiResponse<List<SignalementResponse>>> getSignalementsByStatut(
            @PathVariable StatutSignalement statut) {
        List<SignalementResponse> signalements = signalementService.getSignalementsByStatut(statut);
        return ResponseEntity.ok(ApiResponse.success(signalements));
    }
    
    @Operation(summary = "Obtenir les signalements par type de travaux")
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<SignalementResponse>>> getSignalementsByType(
            @PathVariable TypeTravaux type) {
        List<SignalementResponse> signalements = signalementService.getSignalementsByType(type);
        return ResponseEntity.ok(ApiResponse.success(signalements));
    }
    
    @Operation(summary = "Obtenir les signalements non synchronisés")
    @GetMapping("/unsynced")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<List<SignalementResponse>>> getUnsyncedSignalements() {
        List<SignalementResponse> signalements = signalementService.getUnsyncedSignalements();
        return ResponseEntity.ok(ApiResponse.success(signalements));
    }
    
    @Operation(summary = "Mettre à jour un signalement")
    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<SignalementResponse>> updateSignalement(
            @PathVariable Long id,
            @Valid @RequestBody SignalementRequest request) {
        SignalementResponse response = signalementService.updateSignalement(id, request);
        return ResponseEntity.ok(ApiResponse.success("Signalement mis à jour avec succès", response));
    }
    
    @Operation(summary = "Mettre à jour le statut d'un signalement")
    @PatchMapping("/{id}/statut")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<SignalementResponse>> updateStatut(
            @PathVariable Long id,
            @RequestParam StatutSignalement statut) {
        SignalementResponse response = signalementService.updateStatut(id, statut);
        return ResponseEntity.ok(ApiResponse.success("Statut mis à jour avec succès", response));
    }
    
    @Operation(summary = "Supprimer un signalement")
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteSignalement(@PathVariable Long id) {
        signalementService.deleteSignalement(id);
        return ResponseEntity.ok(ApiResponse.success("Signalement supprimé avec succès", null));
    }
    
    @Operation(summary = "Marquer un signalement comme synchronisé")
    @PostMapping("/{id}/sync")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<Void>> markAsSynced(@PathVariable Long id) {
        signalementService.markAsSynced(id);
        return ResponseEntity.ok(ApiResponse.success("Signalement marqué comme synchronisé", null));
    }
}
