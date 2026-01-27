package com.roadissues.api.controllers;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.models.dto.*;
import com.roadissues.api.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {
    
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * Register new user
     */
    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - Email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Login user
     */
    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and get JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - Email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current user profile
     */
    @GetMapping("/me")
    @Operation(summary = "Get user profile", description = "Retrieve current user profile information")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        log.info("GET /api/auth/me - User: {}", authentication.getName());
        Long userId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        UserProfileDto profile = authService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update user profile
     */
    @PatchMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update current user profile information")
    public ResponseEntity<UserProfileDto> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("PATCH /api/auth/profile - User: {}", authentication.getName());
        Long userId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        UserProfileDto profile = authService.updateProfile(userId, request);
        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/password")
    @Operation(summary = "Change password", description = "Change current user password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("PATCH /api/auth/password - User: {}", authentication.getName());
        Long userId = jwtTokenProvider.getUserIdFromToken(extractToken(authentication));
        authService.changePassword(userId, request);
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
