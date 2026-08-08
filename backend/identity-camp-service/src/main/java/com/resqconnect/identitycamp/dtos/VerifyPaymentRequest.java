package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {
    @NotBlank(message = "Razorpay Order ID is required.")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay Payment ID is required.")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay Signature is required.")
    private String razorpaySignature;
}
