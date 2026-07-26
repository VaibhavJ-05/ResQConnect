package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.User;
import com.resqconnect.identitycamp.models.Volunteer;
import com.resqconnect.identitycamp.repositories.RoleRepository;
import com.resqconnect.identitycamp.repositories.UserRepository;
import com.resqconnect.identitycamp.repositories.VolunteerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VolunteerRepository volunteerRepository;

    public UserController(UserRepository userRepository, 
                          RoleRepository roleRepository,
                          VolunteerRepository volunteerRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.volunteerRepository = volunteerRepository;
    }

    @PreAuthorize("hasRole('Admin')")
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll()
                .stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasAnyRole('Admin', 'Government Officer')")
    @GetMapping("/ngos")
    public ResponseEntity<List<UserDto>> getNGOs() {
        List<UserDto> ngos = userRepository.findByRoleIdAndIsActiveTrue(3) // NGO role is 3
                .stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ngos);
    }

    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }
        return ResponseEntity.ok(mapToUserDto(user));
    }

    @PreAuthorize("hasRole('Admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserDto updateUserDto) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        if (roleRepository.findById(updateUserDto.getRoleId()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid Role ID."));
        }

        user.setName(updateUserDto.getName());
        user.setEmail(updateUserDto.getEmail());
        user.setPhone(updateUserDto.getPhone());
        user.setRoleId(updateUserDto.getRoleId());
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToUserDto(updatedUser));
    }

    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        // If user is volunteer, clean up volunteer details
        volunteerRepository.findByUserId(id).ifPresent(volunteerRepository::delete);

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
    }

    @PreAuthorize("hasRole('Admin')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        user.setIsActive(!user.getIsActive());
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User " + (updated.getIsActive() ? "activated" : "deactivated") + " successfully.",
                "isActive", updated.getIsActive()
        ));
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRoleId(user.getRoleId());
        dto.setRoleName(getRoleName(user.getRoleId()));
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setIsActive(user.getIsActive());
        dto.setCampId(user.getCampId());

        if (user.getRoleId() == 2) {
            volunteerRepository.findByUserId(user.getId()).ifPresent(vol -> {
                VolunteerDto volDto = new VolunteerDto();
                volDto.setId(vol.getId());
                volDto.setUserId(vol.getUserId());
                volDto.setUserName(user.getName());
                volDto.setUserEmail(user.getEmail());
                volDto.setUserPhone(user.getPhone());
                volDto.setSkills(vol.getSkills());
                volDto.setAvailabilityStatus(vol.getAvailabilityStatus());
                volDto.setCurrentLocation(vol.getCurrentLocation());
                volDto.setVerificationStatus(vol.getVerificationStatus());
                volDto.setSkillTier(vol.getSkillTier());
                volDto.setCredibilityScore(vol.getCredibilityScore());
                volDto.setDocumentUrl(vol.getDocumentUrl());
                volDto.setIdProofNumber(vol.getIdProofNumber());
                volDto.setAssignedNGOId(vol.getAssignedNgoId());
                if (vol.getAssignedNgoId() != null) {
                    userRepository.findById(vol.getAssignedNgoId()).ifPresent(ngo -> {
                        volDto.setAssignedNGOName(ngo.getName());
                    });
                }
                dto.setVolunteer(volDto);
            });
        }

        return dto;
    }

    private String getRoleName(int roleId) {
        return switch (roleId) {
            case 1 -> "Victim";
            case 2 -> "Volunteer";
            case 3 -> "NGO";
            case 4 -> "Government Officer";
            case 5 -> "Admin";
            default -> "Victim";
        };
    }
}
