package com.cloud.dev.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttemptResponse {
    private Long id;
    private String ipAddress;
    private String userAgent;
    private Boolean success;
    private String failureReason;
    private LocalDateTime attemptedAt;
}
