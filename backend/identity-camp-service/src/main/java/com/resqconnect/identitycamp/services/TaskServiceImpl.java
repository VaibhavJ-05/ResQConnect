package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.*;
import com.resqconnect.identitycamp.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final VolunteerRepository volunteerRepository;
    private final ReliefCampRepository campRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, 
                           VolunteerRepository volunteerRepository,
                           ReliefCampRepository campRepository, 
                           UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.volunteerRepository = volunteerRepository;
        this.campRepository = campRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<TaskDto> getTasks(Integer campId, Integer userId, String role) {
        if ("ROLE_Volunteer".equals(role)) {
            Optional<Volunteer> volOpt = volunteerRepository.findByUserId(userId);
            if (volOpt.isEmpty()) {
                return Collections.emptyList();
            }
            return taskRepository.findByVolunteerId(volOpt.get().getId())
                    .stream()
                    .map(this::mapToTaskDto)
                    .collect(Collectors.toList());
        }

        if (campId != null) {
            return taskRepository.findByCampId(campId)
                    .stream()
                    .map(this::mapToTaskDto)
                    .collect(Collectors.toList());
        }

        return taskRepository.findAll()
                .stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTaskById(Integer id, Integer userId, String role) {
        Optional<TaskEntity> taskOpt = taskRepository.findById(id);
        if (taskOpt.isEmpty()) {
            return null;
        }

        TaskEntity task = taskOpt.get();

        if ("ROLE_Volunteer".equals(role)) {
            Optional<Volunteer> volOpt = volunteerRepository.findByUserId(userId);
            if (volOpt.isEmpty() || !volOpt.get().getId().equals(task.getVolunteerId())) {
                throw new SecurityException("Access denied.");
            }
        }

        return mapToTaskDto(task);
    }

    @Override
    public TaskDto createTask(CreateTaskDto createDto, Integer userId, String role) {
        if (campRepository.findById(createDto.getCampId()).isEmpty()) {
            throw new IllegalArgumentException("Relief camp not found.");
        }

        if (createDto.getVolunteerId() != null) {
            Volunteer volunteer = volunteerRepository.findById(createDto.getVolunteerId())
                    .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found."));

            if ("ROLE_NGO".equals(role) && volunteer.getAssignedNgoId() != null 
                    && !volunteer.getAssignedNgoId().equals(userId)) {
                throw new IllegalStateException("Volunteer is registered under another NGO.");
            }

            if (volunteer.getSkillTier() < createDto.getRequiredSkillTier()) {
                throw new IllegalStateException("Volunteer's skill tier is insufficient for this task.");
            }
        }

        TaskEntity task = new TaskEntity();
        task.setCampId(createDto.getCampId());
        task.setVolunteerId(createDto.getVolunteerId());
        task.setDescription(createDto.getDescription());
        task.setPriority(createDto.getPriority());
        task.setRequiredSkillTier(createDto.getRequiredSkillTier());
        task.setStatus("Assigned");
        task.setAssignedDate(LocalDateTime.now());

        TaskEntity saved = taskRepository.save(task);
        return mapToTaskDto(saved);
    }

    @Override
    public TaskDto updateTask(Integer id, UpdateTaskDto updateDto, Integer userId, String role) {
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found."));

        if ("ROLE_Volunteer".equals(role)) {
            Optional<Volunteer> volOpt = volunteerRepository.findByUserId(userId);
            if (volOpt.isEmpty() || !volOpt.get().getId().equals(task.getVolunteerId())) {
                throw new SecurityException("Access denied.");
            }
            task.setStatus(updateDto.getStatus());
            if ("Completed".equalsIgnoreCase(updateDto.getStatus())) {
                task.setCompletedDate(LocalDateTime.now());
            }
        } else {
            // Admin/NGO can assign volunteer and change status
            if (updateDto.getVolunteerId() != null) {
                Volunteer volunteer = volunteerRepository.findById(updateDto.getVolunteerId())
                        .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found."));

                if ("ROLE_NGO".equals(role) && volunteer.getAssignedNgoId() != null 
                        && !volunteer.getAssignedNgoId().equals(userId)) {
                    throw new IllegalStateException("Volunteer is registered under another NGO.");
                }

                if (volunteer.getSkillTier() < task.getRequiredSkillTier()) {
                    throw new IllegalStateException("Volunteer's skill tier is insufficient for this task.");
                }
                task.setVolunteerId(updateDto.getVolunteerId());
            } else {
                task.setVolunteerId(null);
            }
            task.setStatus(updateDto.getStatus());
            if ("Completed".equalsIgnoreCase(updateDto.getStatus())) {
                task.setCompletedDate(LocalDateTime.now());
            }
        }

        TaskEntity saved = taskRepository.save(task);
        return mapToTaskDto(saved);
    }

    @Override
    public TaskDto updateProgress(Integer id, UpdateTaskProgressDto progressDto, Integer userId) {
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found."));

        Optional<Volunteer> volOpt = volunteerRepository.findByUserId(userId);
        if (volOpt.isEmpty() || !volOpt.get().getId().equals(task.getVolunteerId())) {
            throw new SecurityException("Access denied.");
        }

        if (progressDto.getProgressNotes() != null) {
            task.setProgressNotes(progressDto.getProgressNotes());
        }
        if (progressDto.getProofImageUrl() != null) {
            task.setProofImageUrl(progressDto.getProofImageUrl());
        }

        TaskEntity saved = taskRepository.save(task);
        return mapToTaskDto(saved);
    }

    @Override
    public TaskDto updateStatus(Integer id, String status, Integer userId) {
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found."));

        Optional<Volunteer> volOpt = volunteerRepository.findByUserId(userId);
        if (volOpt.isEmpty() || !volOpt.get().getId().equals(task.getVolunteerId())) {
            throw new SecurityException("Access denied.");
        }

        task.setStatus(status);
        if ("Completed".equalsIgnoreCase(status)) {
            task.setCompletedDate(LocalDateTime.now());
        }

        TaskEntity saved = taskRepository.save(task);
        return mapToTaskDto(saved);
    }

    private TaskDto mapToTaskDto(TaskEntity task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setVolunteerId(task.getVolunteerId());
        dto.setCampId(task.getCampId());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setRequiredSkillTier(task.getRequiredSkillTier());
        dto.setAssignedDate(task.getAssignedDate());
        dto.setCompletedDate(task.getCompletedDate());
        dto.setProgressNotes(task.getProgressNotes());
        dto.setProofImageUrl(task.getProofImageUrl());

        campRepository.findById(task.getCampId()).ifPresent(c -> {
            dto.setCampName(c.getName());
        });

        if (task.getVolunteerId() != null) {
            volunteerRepository.findById(task.getVolunteerId()).ifPresent(v -> {
                userRepository.findById(v.getUserId()).ifPresent(u -> {
                    dto.setVolunteerName(u.getName());
                });
            });
        }

        return dto;
    }
}
