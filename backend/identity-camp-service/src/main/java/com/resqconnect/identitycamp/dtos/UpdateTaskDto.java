package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateTaskDto {
    private Integer volunteerId;

    @NotBlank(message = "Status is required.")
    @Size(max = 20)
    private String status;
}
