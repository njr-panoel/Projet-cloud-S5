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

@Tag(name = "Synchronisation", description = "Synchronisation Firebase / PostgreSQL")
@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class SyncController {
    
    private final SyncService syncService;
    
    @Operation(summary = "Synchroniser les signalements vers Firebase")
    @PostMapping("/to-firebase")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<Void>> syncToFirebase() {
        syncService.syncSignalementsToFirebase();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation vers Firebase lancée", null));
    }
    
    @Operation(summary = "Synchroniser les signalements depuis Firebase")
    @PostMapping("/from-firebase")
    @PreAuthorize("hasAnyRole('MANAGER', 'UTILISATEUR_MOBILE')")
    public ResponseEntity<ApiResponse<Void>> syncFromFirebase() {
        syncService.syncSignalementsFromFirebase();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation depuis Firebase lancée", null));
    }
    
    @Operation(summary = "Obtenir les statistiques de synchronisation")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSyncStats() {
        Map<String, Object> stats = syncService.getSyncStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @Operation(summary = "Synchroniser les comptes mobiles vers Firebase")
    @PostMapping("/users-to-firebase")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> syncUsersToFirebase() {
        syncService.syncUsersToFirebase();
        return ResponseEntity.ok(ApiResponse.success("Comptes mobiles synchronisés vers Firebase", null));
    }
    
    @Operation(summary = "Synchronisation complète (signalements + utilisateurs)")
    @PostMapping("/full")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> fullSync() {
        syncService.syncSignalementsToFirebase();
        syncService.syncUsersToFirebase();
        return ResponseEntity.ok(ApiResponse.success("Synchronisation complète effectuée", null));
    }
}
