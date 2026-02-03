package com.cloud.dev.controller;

import com.cloud.dev.dto.request.LoginRequest;
import com.cloud.dev.dto.request.RegisterRequest;
import com.cloud.dev.dto.response.ApiResponse;
import com.cloud.dev.dto.response.AuthResponse;
import com.cloud.dev.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentification", description = "Endpoints pour l'authentification hybride (Firebase/Local)")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @Operation(summary = "Inscription d'un nouvel utilisateur")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Inscription réussie", response));
    }
    
    @Operation(summary = "Connexion (Firebase ou Local)")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Connexion réussie", response));
    }
    
    @Operation(summary = "Déconnexion")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Déconnexion réussie", null));
    }
    
    @Operation(summary = "Vérifier le statut de l'authentification")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<String>> getCurrentUser(Authentication authentication) {
        if (authentication != null) {
            return ResponseEntity.ok(ApiResponse.success("Authentifié", authentication.getName()));
        }
        return ResponseEntity.ok(ApiResponse.error("Non authentifié"));
    }
}
