package com.resqconnect.identitycamp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "volunteer_id")
    private Integer volunteerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id", insertable = false, updatable = false)
    @JsonIgnore
    private Volunteer volunteer;

    @Column(name = "camp_id", nullable = false)
    private Integer campId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camp_id", insertable = false, updatable = false)
    @JsonIgnore
    private ReliefCamp reliefCamp;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 20)
    private String priority = "Medium"; // Low, Medium, High

    @Column(nullable = false, length = 20)
    private String status = "Assigned"; // Assigned, InProgress, Completed, Cancelled

    @Column(nullable = false)
    private Integer requiredSkillTier = 1;

    private LocalDateTime assignedDate = LocalDateTime.now();

    private LocalDateTime completedDate;

    @Column(length = 1000)
    private String progressNotes;

    @Column(length = 500)
    private String proofImageUrl;
}
