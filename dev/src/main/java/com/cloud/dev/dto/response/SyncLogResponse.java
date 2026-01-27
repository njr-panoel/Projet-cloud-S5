package com.cloud.dev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncLogResponse {
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String firebaseId;
    private Boolean success;
    private String errorMessage;
    private LocalDateTime syncedAt;
}
