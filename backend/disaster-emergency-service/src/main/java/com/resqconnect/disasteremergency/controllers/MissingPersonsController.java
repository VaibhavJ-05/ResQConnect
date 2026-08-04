package com.resqconnect.disasteremergency.controllers;

import com.resqconnect.disasteremergency.dtos.*;
import com.resqconnect.disasteremergency.services.MissingPersonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missing-persons")
public class MissingPersonsController {

    private final MissingPersonService missingPersonService;

    public MissingPersonsController(MissingPersonService missingPersonService) {
        this.missingPersonService = missingPersonService;
    }

    @GetMapping
    public ResponseEntity<List<MissingPersonDto>> getAll() {
        return ResponseEntity.ok(missingPersonService.getAllMissingPersons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        MissingPersonDto report = missingPersonService.getMissingPersonById(id);
        if (report == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Missing person report not found."));
        }
        return ResponseEntity.ok(report);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateMissingPersonDto createDto) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MissingPersonDto result = missingPersonService.reportMissingPerson(createDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @Valid @RequestBody UpdateMissingPersonStatusDto statusDto) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            MissingPersonDto result = missingPersonService.updateStatus(id, statusDto.getStatus(), userId, role);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Missing person report not found."));
            }
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    private Integer getCurrentUserId() {
        try {
            String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return Integer.parseInt(principal);
        } catch (Exception e) {
            return null;
        }
    }

    private String getCurrentUserRole() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                    .iterator().next().getAuthority();
        } catch (Exception e) {
            return "";
        }
    }
}
