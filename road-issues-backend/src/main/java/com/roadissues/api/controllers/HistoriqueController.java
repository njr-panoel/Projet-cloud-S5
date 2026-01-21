package com.roadissues.api.controllers;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.exceptions.UnauthorizedException;
import com.roadissues.api.models.dto.HistoriqueDto;
import com.roadissues.api.services.HistoriqueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for historique endpoints
 */
@RestController
@RequestMapping("/historiques")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Historiques", description = "Action history endpoints")
public class HistoriqueController {
    
    private final HistoriqueService historiqueService;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * Get historique for a signalement
     */
    @GetMapping("/{signalementId}")
    @Operation(summary = "Get historique", description = "Retrieve action history for a signalement (manager only)")
    public ResponseEntity<List<HistoriqueDto>> getHistorique(
            Authentication authentication,
            @PathVariable Long signalementId) {
        
        log.info("GET /api/historiques/{} - User: {}", signalementId, authentication.getName());
        
        String role = jwtTokenProvider.getRoleFromToken(extractToken(authentication));
        if (!"MANAGER".equals(role)) {
            throw new UnauthorizedException("Only managers can view historique");
        }
        
        List<HistoriqueDto> historique = historiqueService.getHistoriqueBySignalement(signalementId);
        return ResponseEntity.ok(historique);
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
