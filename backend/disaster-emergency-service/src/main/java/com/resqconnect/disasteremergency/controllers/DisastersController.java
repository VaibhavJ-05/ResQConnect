package com.resqconnect.disasteremergency.controllers;

import com.resqconnect.disasteremergency.dtos.*;
import com.resqconnect.disasteremergency.services.DisasterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/disasters")
public class DisastersController {

    private final DisasterService disasterService;

    public DisastersController(DisasterService disasterService) {
        this.disasterService = disasterService;
    }

    @GetMapping
    public ResponseEntity<?> getAllDisasters(
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "severity", required = false) String severity,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDescending", defaultValue = "true") boolean sortDescending,
            @RequestParam(value = "activeOnly", defaultValue = "false") boolean activeOnly) {

        String targetStatus = activeOnly ? "Active" : status;
        PagedResult<DisasterDto> result = disasterService.getDisastersFiltered(
                searchTerm, type, severity, targetStatus, pageNumber, pageSize, sortBy, sortDescending);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDisasterStats() {
        Map<String, Object> stats = disasterService.getDisasterStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDisasterById(@PathVariable String id) {
        DisasterDto disaster = disasterService.getDisasterById(id);
        if (disaster == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Disaster event not found."));
        }
        return ResponseEntity.ok(disaster);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @PostMapping
    public ResponseEntity<?> createDisaster(@Valid @RequestBody CreateDisasterDto createDto) {
        // Enforce basic latitude / longitude ranges
        if (createDto.getLatitude() < -90.0 || createDto.getLatitude() > 90.0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid latitude. Must be between -90 and 90."));
        }
        if (createDto.getLongitude() < -180.0 || createDto.getLongitude() > 180.0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid longitude. Must be between -180 and 180."));
        }

        // Validate status values
        String stat = createDto.getStatus();
        if (!"Active".equalsIgnoreCase(stat) && !"Contained".equalsIgnoreCase(stat) && !"Closed".equalsIgnoreCase(stat)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid status. Must be Active, Contained, or Closed."));
        }

        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DisasterDto result = disasterService.createDisaster(createDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDisaster(@PathVariable String id, @Valid @RequestBody CreateDisasterDto updateDto) {
        DisasterDto result = disasterService.updateDisaster(id, updateDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Disaster event not found."));
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasAnyRole('Government Officer', 'Admin')")
    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeDisaster(@PathVariable String id) {
        boolean result = disasterService.closeDisaster(id);
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Disaster event not found or failed to close."));
        }
        return ResponseEntity.ok(Map.of("message", "Disaster event closed successfully."));
    }

    @PreAuthorize("hasAnyRole('Government Officer', 'Admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDisaster(@PathVariable String id) {
        boolean result = disasterService.deleteDisaster(id);
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Disaster event not found."));
        }
        return ResponseEntity.ok(Map.of("message", "Disaster event deleted successfully."));
    }

    private Integer getCurrentUserId() {
        try {
            String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return Integer.parseInt(principal);
        } catch (Exception e) {
            return null;
        }
    }
}
