package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateCampDto {

    private String disasterId; // String reference to MongoDB Disaster

    @NotBlank(message = "Camp name is required.")
    @Size(max = 150)
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-’,./()&]{2,150}$", message = "Camp name can only contain letters, numbers, spaces, and basic punctuation.")
    private String name;

    @NotBlank(message = "Address is required.")
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-’,./()&]{3,255}$", message = "Address can only contain letters, numbers, spaces, and basic punctuation.")
    private String address;

    @NotNull(message = "Latitude is required.")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90.")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90.")
    private Double latitude;

    @NotNull(message = "Longitude is required.")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180.")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180.")
    private Double longitude;

    @NotNull(message = "Capacity is required.")
    @Min(value = 1, message = "Capacity must be at least 1.")
    @Max(value = 100000)
    private Integer capacity;

    @NotNull(message = "CurrentOccupancy is required.")
    @Min(value = 0)
    @Max(value = 100000)
    private Integer currentOccupancy = 0;

    @NotBlank(message = "Contact person is required.")
    @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s'-]{2,100}$", message = "Contact person name can only contain letters, spaces, hyphens, and apostrophes.")
    private String contactPerson;

    @NotBlank(message = "Contact number is required.")
    @Size(max = 20)
    @Pattern(regexp = "^(?:\\+91|0)?[6-9]\\d{9}$", message = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")
    private String contactNumber;
}
