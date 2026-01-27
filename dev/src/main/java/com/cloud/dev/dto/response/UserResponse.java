package com.cloud.dev.dto.response;

import com.cloud.dev.enums.AuthProvider;
import com.cloud.dev.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private Role role;
    private AuthProvider authProvider;
    private Boolean active;
    private Boolean accountLocked;
    private LocalDateTime lockedUntil;
    private Integer loginAttempts;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
