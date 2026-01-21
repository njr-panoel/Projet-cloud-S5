package com.roadissues.api.services;

import com.roadissues.api.config.JwtTokenProvider;
import com.roadissues.api.exceptions.AuthenticationException;
import com.roadissues.api.exceptions.ValidationException;
import com.roadissues.api.models.dto.LoginRequest;
import com.roadissues.api.models.dto.RegisterRequest;
import com.roadissues.api.models.entities.User;
import com.roadissues.api.models.entities.UserRole;
import com.roadissues.api.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 */
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    
    @InjectMocks
    private AuthService authService;
    
    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(authService, "maxLoginAttempts", 3);
        ReflectionTestUtils.setField(authService, "blockDurationMinutes", 30);
        ReflectionTestUtils.setField(authService, "passwordMinLength", 8);
        ReflectionTestUtils.setField(authService, "requireUppercase", true);
        ReflectionTestUtils.setField(authService, "requireNumbers", true);
        ReflectionTestUtils.setField(authService, "requireSpecialChars", true);
    }
    
    @Test
    public void testRegisterSuccess() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .nom("John Doe")
                .email("john@example.com")
                .password("Password123!")
                .build();
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        
        User savedUser = User.builder()
                .id(1L)
                .nom(request.getNom())
                .email(request.getEmail())
                .passwordHash("hashed_password")
                .role(UserRole.USER)
                .build();
        
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(1L, request.getEmail(), UserRole.USER.toString()))
                .thenReturn("jwt_token");
        when(jwtTokenProvider.getTokenExpirationMs()).thenReturn(3600000L);
        
        // Act
        var response = authService.register(request);
        
        // Assert
        assertNotNull(response);
        assertEquals("John Doe", response.getNom());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("jwt_token", response.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    public void testRegisterEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .nom("John Doe")
                .email("existing@example.com")
                .password("Password123!")
                .build();
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        
        // Act & Assert
        assertThrows(ValidationException.class, () -> authService.register(request));
    }
    
    @Test
    public void testLoginSuccess() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("Password123!")
                .build();
        
        User user = User.builder()
                .id(1L)
                .nom("John Doe")
                .email(request.getEmail())
                .passwordHash("hashed_password")
                .role(UserRole.USER)
                .attemptCount(0)
                .build();
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateToken(user.getId(), request.getEmail(), UserRole.USER.toString()))
                .thenReturn("jwt_token");
        when(jwtTokenProvider.getTokenExpirationMs()).thenReturn(3600000L);
        
        // Act
        var response = authService.login(request);
        
        // Assert
        assertNotNull(response);
        assertEquals("John Doe", response.getNom());
        assertEquals("jwt_token", response.getAccessToken());
    }
    
    @Test
    public void testLoginInvalidPassword() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("WrongPassword")
                .build();
        
        User user = User.builder()
                .id(1L)
                .nom("John Doe")
                .email(request.getEmail())
                .passwordHash("hashed_password")
                .role(UserRole.USER)
                .attemptCount(0)
                .build();
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }
    
    @Test
    public void testLoginUserNotFound() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("Password123!")
                .build();
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }
    
    @Test
    public void testInvalidEmailFormat() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .nom("John Doe")
                .email("invalid-email")
                .password("Password123!")
                .build();
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        
        // Act & Assert
        assertThrows(ValidationException.class, () -> authService.register(request));
    }
}
