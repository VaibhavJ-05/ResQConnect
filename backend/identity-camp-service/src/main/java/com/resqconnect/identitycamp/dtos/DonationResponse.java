package com.resqconnect.identitycamp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {
    private Integer id;
    private Integer donorId;
    private String donorName;
    private Integer ngoId;
    private String ngoName;
    private Double amount;
    private String paymentId;
    private String orderId;
    private Boolean anonymous;
    private String message;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
