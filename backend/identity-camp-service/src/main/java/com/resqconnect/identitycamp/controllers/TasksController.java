package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.services.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TasksController {

    private final TaskService taskService;

    public TasksController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<?> getTasks(@RequestParam(value = "campId", required = false) Integer campId) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<TaskDto> tasks = taskService.getTasks(campId, userId, role);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto task = taskService.getTaskById(id, userId, role);
            if (task == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Task not found."));
            }
            return ResponseEntity.ok(task);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('NGO', 'Admin')")
    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody CreateTaskDto createDto) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto result = taskService.createTask(createDto, userId, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", iae.getMessage()));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ise.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('NGO', 'Volunteer', 'Admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Integer id, @Valid @RequestBody UpdateTaskDto updateDto) {
        Integer userId = getCurrentUserId();
        String role = getCurrentUserRole();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto result = taskService.updateTask(id, updateDto, userId, role);
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", iae.getMessage()));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ise.getMessage()));
        }
    }

    @PreAuthorize("hasRole('Volunteer')")
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptTask(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto result = taskService.updateStatus(id, "Accepted", userId);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Task not found."));
            }
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PreAuthorize("hasRole('Volunteer')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTask(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto result = taskService.updateStatus(id, "Rejected", userId);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Task not found."));
            }
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PreAuthorize("hasRole('Volunteer')")
    @PutMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Integer id, @Valid @RequestBody UpdateTaskProgressDto progressDto) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            TaskDto result = taskService.updateProgress(id, progressDto, userId);
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", iae.getMessage()));
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
