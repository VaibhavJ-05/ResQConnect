package com.resqconnect.identitycamp.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDto {
    private Integer id;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String skills;
    private String availabilityStatus;
    private String currentLocation;
    private String verificationStatus;
    private Integer skillTier;
    private Integer credibilityScore;
    private String documentUrl;
    private String idProofNumber;
    private Integer assignedNGOId;
    private String assignedNGOName;
}
