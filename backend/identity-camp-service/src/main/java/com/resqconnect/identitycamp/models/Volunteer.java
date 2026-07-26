package com.resqconnect.identitycamp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "volunteers")
@Data
@NoArgsConstructor
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 500)
    private String skills = "";

    @Column(nullable = false, length = 20)
    private String availabilityStatus = "Available"; // Available, Busy, Offline

    @Column(nullable = false, length = 255)
    private String currentLocation = "";

    @Column(nullable = false, length = 20)
    private String verificationStatus = "Pending"; // Pending, Verified, Rejected

    @Column(nullable = false)
    private Integer skillTier = 1;

    @Column(nullable = false)
    private Integer credibilityScore = 0;

    @Column(length = 500)
    private String documentUrl;

    @Column(length = 50)
    private String idProofNumber;

    @Column(name = "assigned_ngo_id")
    private Integer assignedNgoId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_ngo_id", insertable = false, updatable = false)
    @JsonIgnore
    private User assignedNgo;
}
