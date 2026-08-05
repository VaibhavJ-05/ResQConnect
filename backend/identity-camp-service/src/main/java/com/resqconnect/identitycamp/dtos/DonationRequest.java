package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {

    @NotNull(message = "Donation amount is required.")
    @DecimalMin(value = "1.00", message = "Minimum donation amount is ₹1.00.")
    @DecimalMax(value = "1000000.00", message = "Maximum donation limit per transaction is ₹10,00,000.00.")
    @Digits(integer = 7, fraction = 2, message = "Donation amount cannot have more than 2 decimal places.")
    private Double amount;

    @NotNull(message = "Please select an NGO to donate to.")
    private Integer ngoId;

    @Size(max = 500, message = "Message must not exceed 500 characters.")
    @Pattern(regexp = "^[^<>]*$", message = "Message must not contain HTML or script tags.")
    private String message;

    private Boolean anonymous = false;
}
