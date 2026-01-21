package com.roadissues.api.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO for sync request
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncRequest {
    private List<SignalementSyncDto> signalements;
    private Long lastSyncTimestamp;
}
