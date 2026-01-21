package com.roadissues.api.services;

import com.roadissues.api.exceptions.ResourceNotFoundException;
import com.roadissues.api.exceptions.ValidationException;
import com.roadissues.api.models.dto.*;
import com.roadissues.api.models.entities.Signalement;
import com.roadissues.api.models.entities.User;
import com.roadissues.api.repositories.SignalementRepository;
import com.roadissues.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for signalement operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SignalementService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    /**
     * Create new signalement
     */
    @Transactional
    public SignalementDto createSignalement(Long userId, CreateSignalementRequest request) {
        log.info("Creating signalement for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Validate coordinates
        if (request.getLatitude() < -90 || request.getLatitude() > 90) {
            throw new ValidationException("Invalid latitude");
        }
        if (request.getLongitude() < -180 || request.getLongitude() > 180) {
            throw new ValidationException("Invalid longitude");
        }
        
        Signalement signalement = Signalement.builder()
                .user(user)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .statut(com.roadissues.api.models.entities.SignalementStatut.NOUVEAU)
                .build();
        
        Signalement savedSignalement = signalementRepository.save(signalement);
        log.info("Signalement created: {}", savedSignalement.getId());
        
        return buildSignalementDto(savedSignalement);
    }
    
    /**
     * Get signalements with filters
     */
    @Transactional(readOnly = true)
    public Page<SignalementDto> getSignalements(String statut, LocalDateTime dateMin, 
                                                 LocalDateTime dateMax, String entreprise, 
                                                 Pageable pageable) {
        log.debug("Fetching signalements with filters - statut: {}, dateMin: {}, dateMax: {}, entreprise: {}",
                statut, dateMin, dateMax, entreprise);
        
        Page<Signalement> signalements = signalementRepository.findWithFilters(
                statut, dateMin, dateMax, entreprise, pageable
        );
        
        return signalements.map(this::buildSignalementDto);
    }
    
    /**
     * Get signalement by ID
     */
    @Transactional(readOnly = true)
    public SignalementDto getSignalementById(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement not found"));
        
        return buildSignalementDto(signalement);
    }
    
    /**
     * Get signalements by user
     */
    @Transactional(readOnly = true)
    public Page<SignalementDto> getSignalementsByUser(Long userId, Pageable pageable) {
        log.debug("Fetching signalements for user: {}", userId);
        
        Page<Signalement> signalements = signalementRepository.findByUserIdAndDeletedFalse(userId, pageable);
        return signalements.map(this::buildSignalementDto);
    }
    
    /**
     * Update signalement (manager only)
     */
    @Transactional
    public SignalementDto updateSignalement(Long id, UpdateSignalementRequest request) {
        log.info("Updating signalement: {}", id);
        
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement not found"));
        
        if (request.getStatut() != null && !request.getStatut().isEmpty()) {
            signalement.setStatut(com.roadissues.api.models.entities.SignalementStatut.valueOf(request.getStatut()));
        }
        
        if (request.getSurfaceM2() != null) {
            signalement.setSurfaceM2(request.getSurfaceM2());
        }
        
        if (request.getBudget() != null) {
            signalement.setBudget(request.getBudget());
        }
        
        if (request.getEntreprise() != null && !request.getEntreprise().isEmpty()) {
            signalement.setEntreprise(request.getEntreprise());
        }
        
        Signalement updatedSignalement = signalementRepository.save(signalement);
        log.info("Signalement updated: {}", id);
        
        return buildSignalementDto(updatedSignalement);
    }
    
    /**
     * Delete signalement (soft delete)
     */
    @Transactional
    public void deleteSignalement(Long id) {
        log.info("Deleting signalement: {}", id);
        
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement not found"));
        
        signalement.setDeleted(true);
        signalementRepository.save(signalement);
    }
    
    /**
     * Build signalement DTO
     */
    private SignalementDto buildSignalementDto(Signalement signalement) {
        return SignalementDto.builder()
                .id(signalement.getId())
                .userId(signalement.getUser().getId())
                .nomUtilisateur(signalement.getUser().getNom())
                .latitude(signalement.getLatitude())
                .longitude(signalement.getLongitude())
                .description(signalement.getDescription())
                .photoUrl(signalement.getPhotoUrl())
                .statut(signalement.getStatut().toString())
                .surfaceM2(signalement.getSurfaceM2())
                .budget(signalement.getBudget())
                .entreprise(signalement.getEntreprise())
                .dateCreation(signalement.getDateCreation().toString())
                .dateUpdate(signalement.getDateUpdate().toString())
                .build();
    }
}
