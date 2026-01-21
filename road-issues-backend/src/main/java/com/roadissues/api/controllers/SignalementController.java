package com.roadissues.api.controllers;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.exceptions.UnauthorizedException;
import com.roadissues.api.models.dto.*;
import com.roadissues.api.repositories.UserRepository;
import com.roadissues.api.services.SignalementService;
import com.roadissues.api.services.HistoriqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for signalement endpoints
 */
@RestController
@RequestMapping("/signalements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Signalements", description = "Road issue reporting endpoints")
public class SignalementController {
    
    private final SignalementService signalementService;
    private final HistoriqueService historiqueService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    
    /**
     * Create new signalement
     */
    @PostMapping
    @Operation(summary = "Create signalement", description = "Create a new road issue report")
    public ResponseEntity<SignalementDto> createSignalement(
            Authentication authentication,
            @Valid @RequestBody CreateSignalementRequest request) {
        
        log.info("POST /api/signalements - User: {}", authentication.getName());
        Long userId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        
        SignalementDto signalement = signalementService.createSignalement(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(signalement);
    }
    
    /**
     * Get signalements with filters
     */
    @GetMapping
    @Operation(summary = "Get signalements", description = "Retrieve signalements with optional filters")
    public ResponseEntity<Page<SignalementDto>> getSignalements(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateMin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateMax,
            @RequestParam(required = false) String entreprise,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("GET /api/signalements - Filters: statut={}, dateMin={}, dateMax={}, entreprise={}",
                statut, dateMin, dateMax, entreprise);
        
        Page<SignalementDto> signalements = signalementService.getSignalements(
                statut, dateMin, dateMax, entreprise, pageable
        );
        return ResponseEntity.ok(signalements);
    }
    
    /**
     * Get signalement by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get signalement details", description = "Retrieve a specific signalement by ID")
    public ResponseEntity<SignalementDto> getSignalementById(@PathVariable Long id) {
        log.info("GET /api/signalements/{}", id);
        SignalementDto signalement = signalementService.getSignalementById(id);
        return ResponseEntity.ok(signalement);
    }
    
    /**
     * Get signalements by current user
     */
    @GetMapping("/user/my-reports")
    @Operation(summary = "Get my signalements", description = "Retrieve signalements created by current user")
    public ResponseEntity<Page<SignalementDto>> getMySignalements(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.info("GET /api/signalements/user/my-reports - User: {}", authentication.getName());
        Long userId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        
        Page<SignalementDto> signalements = signalementService.getSignalementsByUser(userId, pageable);
        return ResponseEntity.ok(signalements);
    }
    
    /**
     * Update signalement (manager only)
     */
    @PatchMapping("/{id}")
    @Operation(summary = "Update signalement", description = "Update signalement details (manager only)")
    public ResponseEntity<SignalementDto> updateSignalement(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSignalementRequest request) {
        
        log.info("PATCH /api/signalements/{} - User: {}", id, authentication.getName());
        
        String role = jwtTokenProvider.getRoleFromToken(extractToken(authentication));
        if (!"MANAGER".equals(role)) {
            throw new UnauthorizedException("Only managers can update signalements");
        }
        
        Long managerId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        SignalementDto signalement = signalementService.updateSignalement(id, request);
        
        // Log action
        historiqueService.logAction(id, managerId, "Status updated", 
                "Status: " + request.getStatut() + ", Surface: " + request.getSurfaceM2());
        
        return ResponseEntity.ok(signalement);
    }
    
    /**
     * Delete signalement (manager only, soft delete)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete signalement", description = "Delete a signalement (manager only)")
    public ResponseEntity<Void> deleteSignalement(
            Authentication authentication,
            @PathVariable Long id) {
        
        log.info("DELETE /api/signalements/{} - User: {}", id, authentication.getName());
        
        String role = jwtTokenProvider.getRoleFromToken(extractToken(authentication));
        if (!"MANAGER".equals(role)) {
            throw new UnauthorizedException("Only managers can delete signalements");
        }
        
        Long managerId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        signalementService.deleteSignalement(id);
        historiqueService.logAction(id, managerId, "Deleted", "Signalement deleted by manager");
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Extract JWT token from authentication
     */
    private String extractToken(Authentication authentication) {
        String token = (String) authentication.getCredentials();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return token;
    }
}
