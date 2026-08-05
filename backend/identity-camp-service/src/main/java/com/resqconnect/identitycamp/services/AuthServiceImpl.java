package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.config.JwtTokenProvider;
import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.User;
import com.resqconnect.identitycamp.models.Volunteer;
import com.resqconnect.identitycamp.repositories.UserRepository;
import com.resqconnect.identitycamp.repositories.VolunteerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final VolunteerRepository volunteerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(UserRepository userRepository, 
                           VolunteerRepository volunteerRepository,
                           PasswordEncoder passwordEncoder, 
                           JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.volunteerRepository = volunteerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public UserDto register(RegisterDto registerDto) {
        String normalizedEmail = registerDto.getEmail() != null ? registerDto.getEmail().trim().toLowerCase() : "";
        String normalizedName  = registerDto.getName() != null ? registerDto.getName().trim() : "";
        String normalizedPhone = registerDto.getPhone() != null ? registerDto.getPhone().trim() : "";

        // Check if user already exists
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("An account with this email address already exists.");
        }

        // Create new user entity
        User user = new User();
        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setRoleId(registerDto.getRoleId());
        user.setPasswordHash(passwordEncoder.encode(registerDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // If user is a volunteer, create a default volunteer profile
        if (registerDto.getRoleId() == 2) {
            Volunteer volunteer = new Volunteer();
            volunteer.setUserId(savedUser.getId());
            volunteer.setSkills("General Assistance");
            volunteer.setAvailabilityStatus("Available");
            volunteer.setCurrentLocation("Remote / Online");
            volunteer.setVerificationStatus("Pending");
            volunteer.setAssignedNgoId(registerDto.getAssignedNGOId());
            volunteerRepository.save(volunteer);
        }

        return mapToUserDto(savedUser);
    }

    @Override
    public LoginResponseDto login(LoginDto loginDto) {
        String normalizedEmail = loginDto.getEmail() != null ? loginDto.getEmail().trim().toLowerCase() : "";
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();
        if (user.getIsActive() == null || !user.getIsActive()) {
            return null;
        }

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPasswordHash())) {
            return null;
        }

        UserDto userDto = mapToUserDto(user);
        String token = tokenProvider.generateToken(userDto.getId(), userDto.getEmail(), userDto.getRoleName());

        return new LoginResponseDto(token, userDto);
    }

    @Override
    public UserDto getProfile(Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        return mapToUserDto(user);
    }

    @Override
    public UserDto updateProfile(Integer userId, UpdateProfileDto updateProfileDto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        user.setName(updateProfileDto.getName());
        user.setPhone(updateProfileDto.getPhone());
        user.setUpdatedAt(LocalDateTime.now());

        if (updateProfileDto.getNewPassword() != null && !updateProfileDto.getNewPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(updateProfileDto.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    public boolean changePassword(Integer userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return false;
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    @Override
    public List<UserDto> getActiveNGOs() {
        return userRepository.findByRoleIdAndIsActiveTrue(3) // 3 is NGO
                .stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRoleId(user.getRoleId());
        dto.setRoleName(getRoleName(user.getRoleId()));
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setIsActive(user.getIsActive());
        dto.setCampId(user.getCampId());

        if (user.getRoleId() == 2) {
            volunteerRepository.findByUserId(user.getId()).ifPresent(vol -> {
                VolunteerDto volDto = new VolunteerDto();
                volDto.setId(vol.getId());
                volDto.setUserId(vol.getUserId());
                volDto.setUserName(user.getName());
                volDto.setUserEmail(user.getEmail());
                volDto.setUserPhone(user.getPhone());
                volDto.setSkills(vol.getSkills());
                volDto.setAvailabilityStatus(vol.getAvailabilityStatus());
                volDto.setCurrentLocation(vol.getCurrentLocation());
                volDto.setVerificationStatus(vol.getVerificationStatus());
                volDto.setSkillTier(vol.getSkillTier());
                volDto.setCredibilityScore(vol.getCredibilityScore());
                volDto.setDocumentUrl(vol.getDocumentUrl());
                volDto.setIdProofNumber(vol.getIdProofNumber());
                volDto.setAssignedNGOId(vol.getAssignedNgoId());
                if (vol.getAssignedNgoId() != null) {
                    userRepository.findById(vol.getAssignedNgoId()).ifPresent(ngo -> {
                        volDto.setAssignedNGOName(ngo.getName());
                    });
                }
                dto.setVolunteer(volDto);
            });
        }

        return dto;
    }

    private String getRoleName(int roleId) {
        return switch (roleId) {
            case 1 -> "Victim";
            case 2 -> "Volunteer";
            case 3 -> "NGO";
            case 4 -> "Government Officer";
            case 5 -> "Admin";
            default -> "Victim";
        };
    }
}
