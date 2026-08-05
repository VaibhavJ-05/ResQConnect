package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto) {
        UserDto result = authService.register(registerDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email address is already in use."));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        LoginResponseDto result = authService.login(loginDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDto result = authService.getProfile(userId);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Profile not found."));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileDto updateProfileDto) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDto result = authService.updateProfile(userId, updateProfileDto);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User profile not found."));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDto changePasswordDto) {
        Integer userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean result = authService.changePassword(userId, 
                changePasswordDto.getCurrentPassword(), 
                changePasswordDto.getNewPassword());
        if (!result) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect."));
        }
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @GetMapping("/ngos")
    public ResponseEntity<List<UserDto>> getActiveNGOs() {
        List<UserDto> ngos = authService.getActiveNGOs();
        return ResponseEntity.ok(ngos);
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
