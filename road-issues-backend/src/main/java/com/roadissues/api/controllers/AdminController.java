package com.roadissues.api.controllers;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.exceptions.UnauthorizedException;
import com.roadissues.api.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for admin endpoints
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Administration endpoints")
public class AdminController {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * Unblock user
     */
    @PostMapping("/unblock/{userId}")
    @Operation(summary = "Unblock user", description = "Reset login attempts and unblock user (manager only)")
    public ResponseEntity<Void> unblockUser(
            Authentication authentication,
            @PathVariable Long userId) {
        
        log.info("POST /api/admin/unblock/{} - User: {}", userId, authentication.getName());
        
        String role = jwtTokenProvider.getRoleFromToken(extractToken(authentication));
        if (!"MANAGER".equals(role)) {
            throw new UnauthorizedException("Only managers can unblock users");
        }
        
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new com.roadissues.api.exceptions.ResourceNotFoundException("User not found"));
        
        user.resetBlockage();
        userRepository.save(user);
        
        log.info("User {} unblocked", userId);
        return ResponseEntity.ok().build();
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
