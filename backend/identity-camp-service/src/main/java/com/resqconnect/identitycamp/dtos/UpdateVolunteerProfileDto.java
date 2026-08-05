package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateVolunteerProfileDto {
    @NotBlank(message = "Skills is required.")
    @Size(max = 500)
    private String skills;

    @NotBlank(message = "Availability status is required.")
    @Size(max = 20)
    private String availabilityStatus;

    @NotBlank(message = "Current location is required.")
    @Size(max = 255)
    private String currentLocation;

    @Size(max = 500)
    private String documentUrl;

    @Size(max = 50)
    private String idProofNumber;
}
