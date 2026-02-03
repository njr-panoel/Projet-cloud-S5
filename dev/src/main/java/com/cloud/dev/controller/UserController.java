package com.cloud.dev.controller;

import com.cloud.dev.dto.request.CreateManagerRequest;
import com.cloud.dev.dto.response.ApiResponse;
import com.cloud.dev.dto.response.UserResponse;
import com.cloud.dev.enums.Role;
import com.cloud.dev.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserService userService;
    
    @Operation(summary = "Obtenir tous les utilisateurs (Manager uniquement)")
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @Operation(summary = "Obtenir un utilisateur par ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @Operation(summary = "Obtenir les utilisateurs par rôle")
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable Role role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @Operation(summary = "Obtenir les comptes verrouillés")
    @GetMapping("/locked")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getLockedUsers() {
        List<UserResponse> users = userService.getLockedUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @Operation(summary = "Débloquer un utilisateur (Manager uniquement)")
    @PostMapping("/unlock/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable Long id) {
        UserResponse user = userService.unlockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur débloqué avec succès", user));
    }
    
    @Operation(summary = "Mettre à jour le rôle d'un utilisateur")
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        UserResponse user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("Rôle mis à jour avec succès", user));
    }
    
    @Operation(summary = "Supprimer un utilisateur")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur supprimé avec succès", null));
    }
    
    @Operation(summary = "Créer un nouveau manager (Manager uniquement)")
    @PostMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<UserResponse>> createManager(
            @Valid @RequestBody CreateManagerRequest request) {
        UserResponse user = userService.createManager(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Manager créé avec succès", user));
    }
}
