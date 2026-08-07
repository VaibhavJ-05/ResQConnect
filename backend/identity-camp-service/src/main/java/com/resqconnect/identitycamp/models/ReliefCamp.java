package com.resqconnect.identitycamp.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "relief_camps")
@Data
@NoArgsConstructor
public class ReliefCamp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // References MongoDB Disaster ObjectId
    @Column(name = "disaster_id")
    private String disasterId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer currentOccupancy = 0;

    @Column(nullable = false, length = 100)
    private String contactPerson;

    @Column(nullable = false, length = 20)
    private String contactNumber;

    private LocalDateTime createdAt = LocalDateTime.now();
}
