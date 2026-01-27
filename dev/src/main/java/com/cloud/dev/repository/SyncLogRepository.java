package com.cloud.dev.repository;

import com.cloud.dev.entity.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
    
    List<SyncLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    
    List<SyncLog> findBySuccess(Boolean success);

    List<SyncLog> findBySuccessOrderBySyncedAtDesc(Boolean success);
    
    List<SyncLog> findBySyncedAtBetween(LocalDateTime start, LocalDateTime end);
}
