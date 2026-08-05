package com.resqconnect.identitycamp.controllers;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.services.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@Tag(name = "Donations", description = "APIs for donation management and Razorpay integration")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping("/create-order")
    @Operation(summary = "Initiate a donation and create a Razorpay Order")
    public ResponseEntity<?> createOrder(@Valid @RequestBody DonationRequest request) {
        Integer donorId = getCurrentUserId();
        try {
            CreateOrderResponse response = donationService.createOrder(request, donorId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify the Razorpay payment signature and save the donation")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        try {
            DonationResponse response = donationService.verifyPayment(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('Victim', 'Volunteer', 'Government Officer', 'NGO')")
    @Operation(summary = "Get donation history of the current authenticated user")
    public ResponseEntity<List<DonationResponse>> getMyDonations() {
        Integer donorId = getCurrentUserId();
        if (donorId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<DonationResponse> history = donationService.getMyDonations(donorId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/ngo/stats")
    @PreAuthorize("hasRole('NGO')")
    @Operation(summary = "Get donation dashboard statistics for the logged-in NGO")
    public ResponseEntity<?> getNgoStats() {
        Integer ngoId = getCurrentUserId();
        if (ngoId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            NgoDonationStats stats = donationService.getNgoStats(ngoId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('Admin')")
    @Operation(summary = "Get platform-wide donation statistics for Admin")
    public ResponseEntity<?> getAdminStats() {
        try {
            AdminDonationStats stats = donationService.getAdminStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
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
}
