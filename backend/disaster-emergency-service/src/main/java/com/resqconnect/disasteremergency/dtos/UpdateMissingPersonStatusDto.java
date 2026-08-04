package com.resqconnect.disasteremergency.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateMissingPersonStatusDto {
    @NotBlank(message = "Status is required.")
    @Size(max = 20)
    private String status; // Missing, Found
}
