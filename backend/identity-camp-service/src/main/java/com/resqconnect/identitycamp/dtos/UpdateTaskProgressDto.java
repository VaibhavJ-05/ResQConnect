package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateTaskProgressDto {
    @Size(max = 1000)
    private String progressNotes;

    @Size(max = 500)
    private String proofImageUrl;
}
