package com.roadissues.api.services;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.exceptions.*;
import com.roadissues.api.models.dto.*;
import com.roadissues.api.models.entities.User;
import com.roadissues.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

/**
 * Service for authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${auth.max-login-attempts:3}")
    private int maxLoginAttempts;
    
    @Value("${auth.block-duration-minutes:30}")
    private int blockDurationMinutes;
    
    @Value("${auth.password-min-length:8}")
    private int passwordMinLength;
    
    @Value("${auth.password-require-uppercase:true}")
    private boolean requireUppercase;
    
    @Value("${auth.password-require-numbers:true}")
    private boolean requireNumbers;
    
    @Value("${auth.password-require-special-chars:true}")
    private boolean requireSpecialChars;
    
    /**
     * Register new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());
        
        // Validate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }
        
        // Validate password
        validatePassword(request.getPassword());
        
        // Validate email format
        validateEmailFormat(request.getEmail());
        
        // Create user
        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .role(com.roadissues.api.models.entities.UserRole.USER)
                .attemptCount(0)
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getId());
        
        return buildAuthResponse(savedUser);
    }
    
    /**
     * Login user
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));
        
        // Check if user is blocked
        if (user.isBlocked()) {
            long remainingTime = user.getBlockedUntil().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
            throw new UserBlockedException(
                    "User is blocked. Try again after " + user.getBlockedUntil(),
                    remainingTime
            );
        }
        
        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setAttemptCount(user.getAttemptCount() + 1);
            
            // Check if max attempts exceeded
            if (user.getAttemptCount() >= maxLoginAttempts) {
                user.setBlockedUntil(LocalDateTime.now().plusMinutes(blockDurationMinutes));
                log.warn("User blocked after {} failed attempts: {}", maxLoginAttempts, user.getId());
            }
            
            userRepository.save(user);
            throw new AuthenticationException("Invalid email or password");
        }
        
        // Reset attempt count on successful login
        user.setAttemptCount(0);
        user.setBlockedUntil(null);
        userRepository.save(user);
        
        log.info("User logged in successfully: {}", user.getId());
        return buildAuthResponse(user);
    }
    
    /**
     * Get user profile
     */
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return buildUserProfileDto(user);
    }
    
    /**
     * Update user profile
     */
    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // If updating email, check if it's available
        if (request.getEmail() != null && !request.getEmail().isEmpty() && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ValidationException("Email already exists");
            }
            validateEmailFormat(request.getEmail());
            user.setEmail(request.getEmail());
        }
        
        user.setNom(request.getNom());
        User updatedUser = userRepository.save(user);
        
        log.info("User profile updated: {}", userId);
        return buildUserProfileDto(updatedUser);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        validatePassword(request.getNewPassword());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("User password changed: {}", userId);
    }
    
    /**
     * Validate email format
     */
    private void validateEmailFormat(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        Pattern pattern = Pattern.compile(emailRegex);
        
        if (!pattern.matcher(email).matches()) {
            throw new ValidationException("Invalid email format");
        }
    }
    
    /**
     * Validate password strength
     */
    private void validatePassword(String password) {
        if (password.length() < passwordMinLength) {
            throw new ValidationException(
                    "Password must be at least " + passwordMinLength + " characters long"
            );
        }
        
        if (requireUppercase && !password.matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain at least one uppercase letter");
        }
        
        if (requireNumbers && !password.matches(".*\\d.*")) {
            throw new ValidationException("Password must contain at least one digit");
        }
        
        if (requireSpecialChars && !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>?].*")) {
            throw new ValidationException("Password must contain at least one special character");
        }
    }
    
    /**
     * Build auth response
     */
    private AuthResponse buildAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        
        return AuthResponse.builder()
                .userId(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .accessToken(token)
                .expiresIn(jwtTokenProvider.getTokenExpirationMs())
                .build();
    }
    
    /**
     * Build user profile DTO
     */
    private UserProfileDto buildUserProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .createdAt(user.getCreatedAt().toString())
                .updatedAt(user.getUpdatedAt().toString())
                .build();
    }
}
