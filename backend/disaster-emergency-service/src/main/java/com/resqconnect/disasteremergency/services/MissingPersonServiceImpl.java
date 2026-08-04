package com.resqconnect.disasteremergency.services;

import com.resqconnect.disasteremergency.dtos.*;
import com.resqconnect.disasteremergency.models.*;
import com.resqconnect.disasteremergency.repositories.*;
import org.springframework.stereotype.Service;
import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MissingPersonServiceImpl implements MissingPersonService {

    private final MissingPersonRepository missingPersonRepository;
    private final IdentityCampClient identityCampClient;

    public MissingPersonServiceImpl(MissingPersonRepository missingPersonRepository,
                                    IdentityCampClient identityCampClient) {
        this.missingPersonRepository = missingPersonRepository;
        this.identityCampClient = identityCampClient;
    }

    @Override
    public List<MissingPersonDto> getAllMissingPersons() {
        return missingPersonRepository.findAll()
                .stream()
                .map(this::mapToMissingPersonDto)
                .collect(Collectors.toList());
    }

    @Override
    public MissingPersonDto getMissingPersonById(String id) {
        return missingPersonRepository.findById(id)
                .map(this::mapToMissingPersonDto)
                .orElse(null);
    }

    @Override
    public MissingPersonDto reportMissingPerson(CreateMissingPersonDto createDto, Integer reporterId) {
        MissingPerson person = new MissingPerson();
        person.setReporterId(reporterId);
        person.setName(createDto.getName());
        person.setAge(createDto.getAge());
        person.setGender(createDto.getGender());
        person.setLastSeenLocation(createDto.getLastSeenLocation());
        person.setDescription(createDto.getDescription());
        person.setStatus("Missing");
        person.setCreatedAt(LocalDateTime.now());

        if (createDto.getPhotoBase64() != null && createDto.getPhotoBase64().startsWith("data:image")) {
            String photoUrl = saveBase64Image(createDto.getPhotoBase64(), "missing");
            person.setPhoto(photoUrl != null ? photoUrl : "/uploads/default.jpg");
        } else {
            person.setPhoto("/uploads/default.jpg");
        }

        MissingPerson saved = missingPersonRepository.save(person);
        return mapToMissingPersonDto(saved);
    }

    @Override
    public MissingPersonDto updateStatus(String id, String status, Integer userId, String role) {
        Optional<MissingPerson> opt = missingPersonRepository.findById(id);
        if (opt.isEmpty()) return null;

        MissingPerson person = opt.get();

        // Security check: only reporter, NGO, or Admin can update status
        boolean isNGO = "ROLE_NGO".equalsIgnoreCase(role);
        boolean isAdmin = "ROLE_Admin".equalsIgnoreCase(role);
        if (!person.getReporterId().equals(userId) && !isNGO && !isAdmin) {
            throw new SecurityException("Access denied. You are not authorized to update this report.");
        }

        person.setStatus(status);
        MissingPerson saved = missingPersonRepository.save(person);
        return mapToMissingPersonDto(saved);
    }

    private String saveBase64Image(String base64Str, String prefix) {
        try {
            String parts[] = base64Str.split(",");
            String base64Data = parts.length > 1 ? parts[1] : parts[0];
            byte[] bytes = Base64.getDecoder().decode(base64Data.trim());

            File uploadsDir = new File("d:/VJ/WorkSpaces/AntiGravityWorkspace/ResQConnect/backend/disaster-emergency-service/src/main/resources/static/uploads");
            if (!uploadsDir.exists()) {
                uploadsDir.mkdirs();
            }

            String fileName = prefix + "_" + UUID.randomUUID().toString() + ".jpg";
            File file = new File(uploadsDir, fileName);
            Files.write(file.toPath(), bytes);

            return "/uploads/" + fileName;
        } catch (Exception e) {
            System.err.println("Error saving image: " + e.getMessage());
            return null;
        }
    }

    private MissingPersonDto mapToMissingPersonDto(MissingPerson person) {
        MissingPersonDto dto = new MissingPersonDto();
        dto.setId(person.getId());
        dto.setReporterId(person.getReporterId());
        dto.setName(person.getName());
        dto.setAge(person.getAge());
        dto.setGender(person.getGender());
        dto.setPhoto(person.getPhoto());
        dto.setLastSeenLocation(person.getLastSeenLocation());
        dto.setDescription(person.getDescription());
        dto.setStatus(person.getStatus());
        dto.setCreatedAt(person.getCreatedAt());

        if (person.getReporterId() != null) {
            try {
                UserDto user = identityCampClient.getUserById(person.getReporterId());
                if (user != null) {
                    dto.setReporterName(user.getName());
                    dto.setReporterPhone(user.getPhone());
                }
            } catch (Exception e) {
                dto.setReporterName("Relief Officer");
            }
        }

        return dto;
    }
}
