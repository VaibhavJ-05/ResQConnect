package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateVolunteerProfileDto {
    @NotBlank(message = "Skills is required.")
    @Size(max = 500)
    private String skills;

    @NotBlank(message = "Current location is required.")
    @Size(max = 255)
    private String currentLocation;
}
