package com.resqconnect.identitycamp.dtos;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RegisterDto {

    @NotBlank(message = "Name is required.")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters.")
    @Pattern(regexp = "^[A-Za-z]+(?: [A-Za-z]+)*$", message = "Name can only contain alphabets and single spaces between words.")
    private String name;

    @NotBlank(message = "Please enter a valid email address.")
    @Email(message = "Please enter a valid email address.")
    @Size(max = 100, message = "Email must not exceed 100 characters.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 32, message = "Password must be between 8 and 32 characters.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+=~<>])[A-Za-z\\d@$!%*?&#^()_+=~<>]{8,32}$", 
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    )
    private String password;

    @NotBlank(message = "Enter a valid Indian mobile number.")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.")
    private String phone;

    @NotNull(message = "RoleId is required.")
    @Min(value = 1, message = "Invalid role specified.")
    @Max(value = 5, message = "Invalid role specified.")
    private Integer roleId; // 1: Victim, 2: Volunteer, 3: NGO, 4: Government Officer, 5: Admin

    private Integer assignedNGOId;
}
