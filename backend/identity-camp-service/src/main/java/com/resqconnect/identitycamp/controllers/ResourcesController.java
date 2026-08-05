package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.services.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourcesController {

    private final ResourceService resourceService;

    public ResourcesController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceDto>> getResources(@RequestParam("campId") Integer campId) {
        return ResponseEntity.ok(resourceService.getResourcesByCampId(campId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Integer id) {
        ResourceDto resource = resourceService.getResourceById(id);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Camp resource not found."));
        }
        return ResponseEntity.ok(resource);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Admin')")
    @PostMapping
    public ResponseEntity<?> addResource(@Valid @RequestBody CreateResourceDto createDto) {
        ResourceDto result = resourceService.addResource(createDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Associated camp not found."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Volunteer', 'Admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResourceQuantity(@PathVariable Integer id, @RequestBody Integer quantity) {
        if (quantity < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Quantity cannot be negative."));
        }

        ResourceDto result = resourceService.updateQuantity(id, quantity);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Camp resource not found."));
        }

        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasAnyRole('NGO', 'Admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Integer id) {
        boolean result = resourceService.deleteResource(id);
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Camp resource not found."));
        }
        return ResponseEntity.ok(Map.of("message", "Camp resource deleted successfully."));
    }
}
