package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.services.VolunteerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteersController {

    private final VolunteerService volunteerService;

    public VolunteersController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @GetMapping
    public ResponseEntity<List<VolunteerDto>> getAllVolunteers() {
        Integer currentUserId = getCurrentUserId();
        boolean isNGO = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_NGO"));

        List<VolunteerDto> volunteers = volunteerService.getAllVolunteers();

        if (isNGO && currentUserId != null) {
            volunteers = volunteers.stream()
                    .filter(v -> v.getAssignedNGOId() == null || v.getAssignedNGOId().equals(currentUserId))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(volunteers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVolunteerById(@PathVariable Integer id) {
        VolunteerDto volunteer = volunteerService.getVolunteerById(id);
        if (volunteer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Volunteer profile not found."));
        }
        return ResponseEntity.ok(volunteer);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        VolunteerDto volunteer = volunteerService.getVolunteerByUserId(userId);
        if (volunteer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Volunteer profile not found for this user."));
        }
        return ResponseEntity.ok(volunteer);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateVolunteerProfile(@Valid @RequestBody UpdateVolunteerProfileDto updateDto) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        VolunteerDto result = volunteerService.updateProfile(userId, updateDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to update profile. Make sure you are registered as a Volunteer."));
        }

        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Admin')")
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyVolunteer(@PathVariable Integer id, @Valid @RequestBody VerifyVolunteerDto verifyDto) {
        Integer currentUserId = getCurrentUserId();
        boolean isNGO = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_NGO"));

        if (isNGO && currentUserId != null) {
            VolunteerDto volunteer = volunteerService.getVolunteerById(id);
            if (volunteer != null && volunteer.getAssignedNGOId() != null && !volunteer.getAssignedNGOId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        VolunteerDto result = volunteerService.verifyVolunteer(id, verifyDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Volunteer profile not found."));
        }

        return ResponseEntity.ok(result);
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
