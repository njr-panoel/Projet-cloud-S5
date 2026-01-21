package com.roadissues.api.repositories;

import com.roadissues.api.models.entities.Signalement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Signalement entity persistence operations
 */
@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    
    /**
     * Find signalements by user
     */
    Page<Signalement> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);
    
    /**
     * Find signalements by status (not deleted)
     */
    Page<Signalement> findByStatutAndDeletedFalse(String statut, Pageable pageable);
    
    /**
     * Find signalements with filters
     */
    @Query("SELECT s FROM Signalement s WHERE s.deleted = false " +
            "AND (:statut IS NULL OR s.statut = :statut) " +
            "AND (:dateMin IS NULL OR s.dateCreation >= :dateMin) " +
            "AND (:dateMax IS NULL OR s.dateCreation <= :dateMax) " +
            "AND (:entreprise IS NULL OR s.entreprise = :entreprise)")
    Page<Signalement> findWithFilters(
            @Param("statut") String statut,
            @Param("dateMin") LocalDateTime dateMin,
            @Param("dateMax") LocalDateTime dateMax,
            @Param("entreprise") String entreprise,
            Pageable pageable
    );
    
    /**
     * Count signalements by status (not deleted)
     */
    long countByStatutAndDeletedFalse(String statut);
    
    /**
     * Sum surface area (not deleted)
     */
    @Query("SELECT COALESCE(SUM(s.surfaceM2), 0) FROM Signalement s WHERE s.deleted = false")
    Double sumSurfaceArea();
    
    /**
     * Sum budget (not deleted)
     */
    @Query("SELECT COALESCE(SUM(s.budget), 0) FROM Signalement s WHERE s.deleted = false")
    Double sumBudget();
    
    /**
     * Find signalements updated after sync timestamp
     */
    List<Signalement> findBySyncTimestampGreaterThanAndDeletedFalse(Long syncTimestamp);
}
