package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateProfileDto {
    @NotBlank(message = "Name is required.")
    @Size(max = 100)
    private String name;

    @Pattern(regexp = "^(?:\\+91|0)?[6-9]\\d{9}$", message = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")
    private String phone;

    private String newPassword;
}
