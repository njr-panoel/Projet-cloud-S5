package com.roadissues.api.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO for sync response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncResponse {
    private List<SignalementSyncDto> updates;
    private Long syncTimestamp;
}
