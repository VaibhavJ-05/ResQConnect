package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.ReliefCamp;
import com.resqconnect.identitycamp.models.User;
import com.resqconnect.identitycamp.repositories.ReliefCampRepository;
import com.resqconnect.identitycamp.repositories.UserRepository;
import com.resqconnect.identitycamp.services.CampService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/camps")
public class CampsController {

    private final CampService campService;
    private final UserRepository userRepository;
    private final ReliefCampRepository campRepository;

    public CampsController(CampService campService, 
                           UserRepository userRepository, 
                           ReliefCampRepository campRepository) {
        this.campService = campService;
        this.userRepository = userRepository;
        this.campRepository = campRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReliefCampDto>> getAllCamps(@RequestParam(value = "disasterId", required = false) String disasterId) {
        if (disasterId != null && !disasterId.trim().isEmpty()) {
            return ResponseEntity.ok(campService.getCampsByDisasterId(disasterId));
        }
        return ResponseEntity.ok(campService.getAllCamps());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampById(@PathVariable Integer id) {
        ReliefCampDto camp = campService.getCampById(id);
        if (camp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Relief camp not found."));
        }
        return ResponseEntity.ok(camp);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @PostMapping
    public ResponseEntity<?> createCamp(@Valid @RequestBody CreateCampDto createDto) {
        ReliefCampDto result = campService.createCamp(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCamp(@PathVariable Integer id, @Valid @RequestBody CreateCampDto updateDto) {
        ReliefCampDto result = campService.updateCamp(id, updateDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Relief camp not found."));
        }
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Government Officer', 'Admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> closeCamp(@PathVariable Integer id) {
        boolean result = campService.closeCamp(id);
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Relief camp not found or could not be closed."));
        }
        return ResponseEntity.ok(Map.of("message", "Relief camp closed and deleted successfully."));
    }

    @Transactional
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerInCamp(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        ReliefCamp camp = campRepository.findById(id).orElse(null);
        if (camp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Relief camp not found."));
        }

        if (camp.getCurrentOccupancy() >= camp.getCapacity()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cannot register. Camp is at full capacity."));
        }

        // Leave previous camp if registered elsewhere
        if (user.getCampId() != null && !user.getCampId().equals(id)) {
            ReliefCamp oldCamp = campRepository.findById(user.getCampId()).orElse(null);
            if (oldCamp != null && oldCamp.getCurrentOccupancy() > 0) {
                oldCamp.setCurrentOccupancy(oldCamp.getCurrentOccupancy() - 1);
                campRepository.save(oldCamp);
            }
        }

        // Check-in to new camp
        if (!id.equals(user.getCampId())) {
            user.setCampId(id);
            camp.setCurrentOccupancy(camp.getCurrentOccupancy() + 1);
            userRepository.save(user);
            campRepository.save(camp);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Successfully registered in camp.",
                "campId", id,
                "currentOccupancy", camp.getCurrentOccupancy()
        ));
    }

    @Transactional
    @PostMapping("/leave")
    public ResponseEntity<?> leaveCamp() {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        if (user.getCampId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "User is not registered in any camp."));
        }

        Integer leftCampId = user.getCampId();
        ReliefCamp camp = campRepository.findById(leftCampId).orElse(null);
        if (camp != null && camp.getCurrentOccupancy() > 0) {
            camp.setCurrentOccupancy(camp.getCurrentOccupancy() - 1);
            campRepository.save(camp);
        }

        user.setCampId(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Successfully left the camp.",
                "campId", leftCampId,
                "currentOccupancy", camp != null ? camp.getCurrentOccupancy() : 0
        ));
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
