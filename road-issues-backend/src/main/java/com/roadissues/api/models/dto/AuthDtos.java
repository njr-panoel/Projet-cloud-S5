package com.roadissues.api.models.dto;

import lombok.*;
import jakarta.validation.constraints.*;

/**
 * DTO for user registration
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RegisterRequestLegacy {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String nom;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

/**
 * DTO for user login
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class LoginRequestLegacy {
    
    @NotBlank(message = "Email is required")
    @Email
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
}

/**
 * DTO for auth response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AuthResponseLegacy {
    private Long userId;
    private String nom;
    private String email;
    private String role;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
}

/**
 * DTO for user profile update
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UpdateProfileRequestLegacy {
    
    @NotBlank
    @Size(min = 2, max = 100)
    private String nom;
    
    @Email
    private String email;
}

/**
 * DTO for user profile response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class UserProfileDtoLegacy {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private String createdAt;
    private String updatedAt;
}
