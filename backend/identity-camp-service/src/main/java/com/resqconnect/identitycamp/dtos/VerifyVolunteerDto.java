package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VerifyVolunteerDto {
    @NotBlank(message = "Verification status is required.")
    @Size(max = 20)
    private String verificationStatus; // Verified, Rejected

    private Integer skillTier;
}
