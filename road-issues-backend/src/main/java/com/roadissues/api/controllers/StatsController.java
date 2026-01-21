package com.roadissues.api.controllers;

import com.roadissues.api.models.dto.StatsDto;
import com.roadissues.api.services.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for statistics endpoints
 */
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Statistics", description = "Application statistics endpoints")
public class StatsController {
    
    private final StatsService statsService;
    
    /**
     * Get application statistics
     */
    @GetMapping
    @Operation(summary = "Get statistics", description = "Retrieve application statistics")
    public ResponseEntity<StatsDto> getStats() {
        log.info("GET /api/stats");
        StatsDto stats = statsService.getStats();
        return ResponseEntity.ok(stats);
    }
}
