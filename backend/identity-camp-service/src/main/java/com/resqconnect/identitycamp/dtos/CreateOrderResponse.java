package com.resqconnect.identitycamp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponse {
    private String orderId;
    private Integer amount; // in paise
    private String currency;
    private String key; // Razorpay Key ID
    private Integer donationId;
}
