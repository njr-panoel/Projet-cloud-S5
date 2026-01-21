package com.cloud.dev.repository;

import com.cloud.dev.entity.Signalement;
import com.cloud.dev.entity.User;
import com.cloud.dev.enums.StatutSignalement;
import com.cloud.dev.enums.TypeTravaux;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    
    List<Signalement> findByUser(User user);
    
    List<Signalement> findByStatut(StatutSignalement statut);
    
    List<Signalement> findByTypeTravaux(TypeTravaux typeTravaux);
    
    List<Signalement> findBySynced(Boolean synced);
    
    List<Signalement> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<Signalement> findByStatutAndTypeTravaux(StatutSignalement statut, TypeTravaux typeTravaux);
    
    Long countByStatut(StatutSignalement statut);
}
