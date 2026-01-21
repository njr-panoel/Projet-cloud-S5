package com.roadissues.api.services;

import com.roadissues.api.models.dto.StatsDto;
import com.roadissues.api.repositories.SignalementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for statistics operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {
    
    private final SignalementRepository signalementRepository;
    
    /**
     * Get application statistics
     */
    @Transactional(readOnly = true)
    public StatsDto getStats() {
        log.debug("Calculating application statistics");
        
        long nbNouveau = signalementRepository.countByStatutAndDeletedFalse("NOUVEAU");
        long nbEnCours = signalementRepository.countByStatutAndDeletedFalse("EN_COURS");
        long nbTermine = signalementRepository.countByStatutAndDeletedFalse("TERMINE");
        
        long nbPoints = nbNouveau + nbEnCours + nbTermine;
        
        Double totalSurfaceM2 = signalementRepository.sumSurfaceArea();
        if (totalSurfaceM2 == null) {
            totalSurfaceM2 = 0.0;
        }
        
        Double totalBudget = signalementRepository.sumBudget();
        if (totalBudget == null) {
            totalBudget = 0.0;
        }
        
        // Calculate advancement percentage
        // (nombre de signalements terminés / total) * 100
        double avancementPercent = nbPoints > 0 ? (double) nbTermine / nbPoints * 100 : 0;
        
        return StatsDto.builder()
                .nbPoints(nbPoints)
                .totalSurfaceM2(totalSurfaceM2)
                .avancementPercent(avancementPercent)
                .totalBudget(totalBudget)
                .nbNouveau(nbNouveau)
                .nbEnCours(nbEnCours)
                .nbTermine(nbTermine)
                .build();
    }
}
