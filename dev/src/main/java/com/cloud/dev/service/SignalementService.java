package com.cloud.dev.service;

import com.cloud.dev.dto.request.SignalementRequest;
import com.cloud.dev.dto.response.SignalementResponse;
import com.cloud.dev.dto.response.UserResponse;
import com.cloud.dev.entity.Signalement;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import com.cloud.dev.exception.ResourceNotFoundException;
import com.cloud.dev.repository.SignalementRepository;
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
public class SignalementService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public SignalementResponse createSignalement(SignalementRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        Signalement signalement = new Signalement();
        signalement.setTitre(request.getTitre());
        signalement.setDescription(request.getDescription());
        signalement.setTypeTravaux(request.getTypeTravaux());
        signalement.setStatut(request.getStatut() != null ? request.getStatut() : StatutSignalement.NOUVEAU);
        signalement.setLatitude(request.getLatitude());
        signalement.setLongitude(request.getLongitude());
        signalement.setAdresse(request.getAdresse());
        signalement.setPhotos(request.getPhotos());
        signalement.setUser(user);
        signalement.setFirebaseId(request.getFirebaseId());
        
        signalement = signalementRepository.save(signalement);
        log.info("Nouveau signalement créé: {} par {}", signalement.getId(), user.getEmail());
        
        return mapToResponse(signalement);
    }
    
    public List<SignalementResponse> getAllSignalements() {
        return signalementRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public SignalementResponse getSignalementById(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        return mapToResponse(signalement);
    }
    
    public List<SignalementResponse> getSignalementsByStatut(StatutSignalement statut) {
        return signalementRepository.findByStatut(statut).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<SignalementResponse> getSignalementsByType(TypeTravaux type) {
        return signalementRepository.findByTypeTravaux(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<SignalementResponse> getUnsyncedSignalements() {
        return signalementRepository.findBySynced(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SignalementResponse updateSignalement(Long id, SignalementRequest request) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        if (request.getTitre() != null) signalement.setTitre(request.getTitre());
        if (request.getDescription() != null) signalement.setDescription(request.getDescription());
        if (request.getTypeTravaux() != null) signalement.setTypeTravaux(request.getTypeTravaux());
        if (request.getStatut() != null) {
            signalement.setStatut(request.getStatut());
            if (request.getStatut() == StatutSignalement.TERMINE) {
                signalement.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getLatitude() != null) signalement.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) signalement.setLongitude(request.getLongitude());
        if (request.getAdresse() != null) signalement.setAdresse(request.getAdresse());
        if (request.getPhotos() != null) signalement.setPhotos(request.getPhotos());
        
        signalement = signalementRepository.save(signalement);
        log.info("Signalement mis à jour: {}", signalement.getId());
        
        return mapToResponse(signalement);
    }
    
    @Transactional
    public SignalementResponse updateStatut(Long id, StatutSignalement statut) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        signalement.setStatut(statut);
        if (statut == StatutSignalement.TERMINE) {
            signalement.setCompletedAt(LocalDateTime.now());
        }
        
        signalement = signalementRepository.save(signalement);
        log.info("Statut du signalement {} mis à jour: {}", id, statut);
        
        return mapToResponse(signalement);
    }
    
    @Transactional
    public void deleteSignalement(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        signalementRepository.delete(signalement);
        log.info("Signalement supprimé: {}", id);
    }
    
    @Transactional
    public void markAsSynced(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé"));
        
        signalement.setSynced(true);
        signalementRepository.save(signalement);
    }
    
    private SignalementResponse mapToResponse(Signalement signalement) {
        UserResponse userResponse = UserResponse.builder()
                .id(signalement.getUser().getId())
                .email(signalement.getUser().getEmail())
                .nom(signalement.getUser().getNom())
                .prenom(signalement.getUser().getPrenom())
                .role(signalement.getUser().getRole())
                .build();
        
        return SignalementResponse.builder()
                .id(signalement.getId())
                .titre(signalement.getTitre())
                .description(signalement.getDescription())
                .typeTravaux(signalement.getTypeTravaux())
                .statut(signalement.getStatut())
                .latitude(signalement.getLatitude())
                .longitude(signalement.getLongitude())
                .adresse(signalement.getAdresse())
                .photos(signalement.getPhotos())
                .user(userResponse)
                .synced(signalement.getSynced())
                .firebaseId(signalement.getFirebaseId())
                .createdAt(signalement.getCreatedAt())
                .updatedAt(signalement.getUpdatedAt())
                .completedAt(signalement.getCompletedAt())
                .build();
    }
}
