package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import java.util.List;

public interface AuthService {
    UserDto register(RegisterDto registerDto);
    LoginResponseDto login(LoginDto loginDto);
    UserDto getProfile(Integer userId);
    UserDto updateProfile(Integer userId, UpdateProfileDto updateProfileDto);
    boolean changePassword(Integer userId, String currentPassword, String newPassword);
    List<UserDto> getActiveNGOs();
}
