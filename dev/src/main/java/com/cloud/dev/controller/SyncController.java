package com.cloud.dev.controller;

import com.cloud.dev.dto.response.ApiResponse;
import com.cloud.dev.service.SyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Synchronisation", description = "Synchronisation bidirectionnelle Firebase / PostgreSQL")
@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class SyncController {
    
    private final SyncService syncService;
    
    @Operation(summary = "Synchronisation bidirectionnelle complète", 
               description = "Compare et synchronise les données entre PostgreSQL et Firebase dans les deux sens. " +
                           "Crée les comptes Firebase Auth pour les utilisateurs mobiles et synchronise tous les signalements.")
    @PostMapping("/bidirectional")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bidirectionalSync() {
        Map<String, Object> result = syncService.fullBidirectionalSync();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation bidirectionnelle terminée", result));
    }
    
    @Operation(summary = "Synchroniser les signalements vers Firebase (seulement les non-synchronisés)")
    @PostMapping("/to-firebase")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncToFirebase() {
        int synced = syncService.syncSignalementsToFirebase();
        Map<String, Object> result = Map.of(
            "message", "Synchronisation vers Firebase terminée",
            "syncedCount", synced
        );
        return ResponseEntity.ok(ApiResponse.success("Synchronisation vers Firebase terminée", result));
    }
    
    @Operation(summary = "Forcer la synchronisation de TOUS les signalements vers Firebase")
    @PostMapping("/force-to-firebase")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forceSyncToFirebase() {
        int synced = syncService.forceFullSyncToFirebase();
        Map<String, Object> result = Map.of(
            "message", "Force sync vers Firebase terminée",
            "syncedCount", synced
        );
        return ResponseEntity.ok(ApiResponse.success("Force sync vers Firebase terminée", result));
    }
    
    @Operation(summary = "Synchroniser les signalements depuis Firebase vers PostgreSQL",
               description = "Récupère les signalements depuis Firebase et les importe/met à jour dans PostgreSQL")
    @PostMapping("/from-firebase")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncFromFirebase() {
        Map<String, Object> result = syncService.syncSignalementsFromFirebaseSync();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation depuis Firebase terminée", result));
    }
    
    @Operation(summary = "Obtenir les statistiques de synchronisation")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSyncStats() {
        Map<String, Object> stats = syncService.getSyncStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @Operation(summary = "Synchroniser les comptes mobiles vers Firebase Auth",
               description = "Crée les comptes Firebase Auth pour les utilisateurs mobiles et synchronise leurs métadonnées")
    @PostMapping("/users-to-firebase")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncUsersToFirebase() {
        Map<String, Object> result = syncService.syncUsersToFirebaseAuth();
        syncService.syncUsersMetadataToFirebase();
        result.put("metadataSynced", true);
        return ResponseEntity.ok(ApiResponse.success("Comptes mobiles synchronisés vers Firebase", result));
    }
    
    @Operation(summary = "Importer les utilisateurs depuis Firebase vers PostgreSQL",
               description = "Récupère les utilisateurs mobiles depuis Firestore et les importe/met à jour dans PostgreSQL")
    @PostMapping("/users-from-firebase")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncUsersFromFirebase() {
        Map<String, Object> result = syncService.syncUsersFromFirebase();
        return ResponseEntity.ok(ApiResponse.success("Utilisateurs importés depuis Firebase", result));
    }
    
    @Operation(summary = "Synchronisation complète (signalements + utilisateurs)",
               description = "Alias pour la synchronisation bidirectionnelle")
    @PostMapping("/full")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> fullSync() {
        Map<String, Object> result = syncService.fullBidirectionalSync();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation complète effectuée", result));
    }
}
