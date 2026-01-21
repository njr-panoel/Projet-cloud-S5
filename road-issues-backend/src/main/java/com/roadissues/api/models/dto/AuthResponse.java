package com.roadissues.api.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for auth response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private Long userId;
    private String nom;
    private String email;
    private String role;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
}
