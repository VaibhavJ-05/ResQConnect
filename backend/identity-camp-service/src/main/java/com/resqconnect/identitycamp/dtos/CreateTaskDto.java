package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateTaskDto {

    private Integer volunteerId;

    @NotNull(message = "CampId is required.")
    private Integer campId;

    @NotBlank(message = "Description is required.")
    @Size(max = 1000)
    private String description;

    @NotBlank(message = "Priority is required.")
    @Size(max = 20)
    private String priority = "Medium";

    @NotNull(message = "RequiredSkillTier is required.")
    private Integer requiredSkillTier = 1;
}
