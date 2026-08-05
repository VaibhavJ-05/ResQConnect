package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateResourceDto {
    @NotNull(message = "CampId is required.")
    private Integer campId;

    @NotBlank(message = "Resource name is required.")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Quantity is required.")
    @Min(0)
    @Max(1000000)
    private Integer quantity;

    @NotBlank(message = "Unit is required.")
    @Size(max = 20)
    private String unit;

    @NotNull(message = "Threshold quantity is required.")
    @Min(0)
    @Max(1000000)
    private Integer thresholdQuantity;
}
