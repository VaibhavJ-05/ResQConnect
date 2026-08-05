package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import java.util.List;

public interface TaskService {
    List<TaskDto> getTasks(Integer campId, Integer userId, String role);
    TaskDto getTaskById(Integer id, Integer userId, String role);
    TaskDto createTask(CreateTaskDto createDto, Integer userId, String role);
    TaskDto updateTask(Integer id, UpdateTaskDto updateDto, Integer userId, String role);
    TaskDto updateProgress(Integer id, UpdateTaskProgressDto progressDto, Integer userId);
    TaskDto updateStatus(Integer id, String status, Integer userId);
}
