package com.resqconnect.identitycamp.repositories;

import com.resqconnect.identitycamp.models.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<TaskEntity, Integer> {
    List<TaskEntity> findByCampId(Integer campId);
    List<TaskEntity> findByVolunteerId(Integer volunteerId);
}
