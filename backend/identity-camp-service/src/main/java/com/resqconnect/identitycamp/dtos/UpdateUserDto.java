package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateUserDto {
    @NotBlank(message = "Name is required.")
    @Pattern(regexp = "^[a-zA-Z\\s'-]{2,100}$", message = "Name can only contain letters, spaces, hyphens, and apostrophes.")
    private String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    @Size(max = 100)
    private String email;

    @Pattern(regexp = "^(?:\\+91|0)?[6-9]\\d{9}$", message = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")
    private String phone;

    @NotNull(message = "RoleId is required.")
    private Integer roleId;
}
