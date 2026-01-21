package com.cloud.dev.service;

import com.cloud.dev.dto.response.UserResponse;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.Role;
import com.cloud.dev.exception.ResourceNotFoundException;
import com.cloud.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return mapToResponse(user);
    }
    
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return mapToResponse(user);
    }
    
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getLockedUsers() {
        return userRepository.findByAccountLocked(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public UserResponse unlockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        user.setAccountLocked(false);
        user.setLockedUntil(null);
        user.setLoginAttempts(0);
        
        user = userRepository.save(user);
        log.info("Compte débloqué pour l'utilisateur: {}", user.getEmail());
        
        return mapToResponse(user);
    }
    
    @Transactional
    public UserResponse updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        user.setRole(newRole);
        user = userRepository.save(user);
        
        log.info("Rôle mis à jour pour l'utilisateur {}: {}", user.getEmail(), newRole);
        return mapToResponse(user);
    }
    
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        userRepository.delete(user);
        log.info("Utilisateur supprimé: {}", user.getEmail());
    }
    
    @Transactional
    public void unlockExpiredAccounts() {
        List<User> expiredLocked = userRepository.findExpiredLockedAccounts();
        for (User user : expiredLocked) {
            user.setAccountLocked(false);
            user.setLockedUntil(null);
            user.setLoginAttempts(0);
            userRepository.save(user);
            log.info("Déblocage automatique du compte: {}", user.getEmail());
        }
    }
    
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .active(user.getActive())
                .accountLocked(user.getAccountLocked())
                .lockedUntil(user.getLockedUntil())
                .loginAttempts(user.getLoginAttempts())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
