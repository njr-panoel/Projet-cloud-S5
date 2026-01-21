package com.roadissues.api.repositories;

import com.roadissues.api.models.entities.Historique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Historique entity persistence operations
 */
@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    
    /**
     * Find history for a signalement
     */
    @Query("SELECT h FROM Historique h WHERE h.signalement.id = :signalementId ORDER BY h.date DESC")
    List<Historique> findBySignalementId(@Param("signalementId") Long signalementId);
    
    /**
     * Find history by manager
     */
    List<Historique> findByManagerId(Long managerId);
}
