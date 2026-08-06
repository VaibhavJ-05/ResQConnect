package com.resqconnect.identitycamp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "camp_id", nullable = false)
    private Integer campId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camp_id", insertable = false, updatable = false)
    @JsonIgnore
    private ReliefCamp reliefCamp;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false)
    private Integer thresholdQuantity;

    private LocalDateTime updatedAt = LocalDateTime.now();
}
