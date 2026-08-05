package com.resqconnect.identitycamp.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = true)
    private User donor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private User ngo;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "signature")
    private String signature;

    @Column(nullable = false)
    private Boolean anonymous = false;

    @Column(length = 1000)
    private String message;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; // PENDING, SUCCESS, FAILED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
