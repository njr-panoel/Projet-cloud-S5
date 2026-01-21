package com.roadissues.api.services;

import com.roadissues.api.exceptions.ResourceNotFoundException;
import com.roadissues.api.models.dto.HistoriqueDto;
import com.roadissues.api.models.entities.Historique;
import com.roadissues.api.models.entities.Signalement;
import com.roadissues.api.models.entities.User;
import com.roadissues.api.repositories.HistoriqueRepository;
import com.roadissues.api.repositories.SignalementRepository;
import com.roadissues.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for historique operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HistoriqueService {
    
    private final HistoriqueRepository historiqueRepository;
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    /**
     * Get historique for a signalement
     */
    @Transactional(readOnly = true)
    public List<HistoriqueDto> getHistoriqueBySignalement(Long signalementId) {
        log.debug("Fetching historique for signalement: {}", signalementId);
        
        // Verify signalement exists
        signalementRepository.findById(signalementId)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement not found"));
        
        List<Historique> historiques = historiqueRepository.findBySignalementId(signalementId);
        
        return historiques.stream()
                .map(this::buildHistoriqueDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Log action for signalement
     */
    @Transactional
    public void logAction(Long signalementId, Long managerId, String action, String details) {
        log.info("Logging action for signalement {}: {}", signalementId, action);
        
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement not found"));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        
        Historique historique = Historique.builder()
                .signalement(signalement)
                .manager(manager)
                .action(action)
                .details(details)
                .build();
        
        historiqueRepository.save(historique);
    }
    
    /**
     * Build historique DTO
     */
    private HistoriqueDto buildHistoriqueDto(Historique historique) {
        return HistoriqueDto.builder()
                .id(historique.getId())
                .signalementId(historique.getSignalement().getId())
                .managerId(historique.getManager().getId())
                .managerNom(historique.getManager().getNom())
                .action(historique.getAction())
                .details(historique.getDetails())
                .date(historique.getDate().toString())
                .build();
    }
}
