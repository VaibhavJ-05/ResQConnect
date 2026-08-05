package com.resqconnect.identitycamp.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Integer id;
    private Integer volunteerId;
    private String volunteerName;
    private Integer campId;
    private String campName;
    private String description;
    private String priority;
    private String status;
    private Integer requiredSkillTier;
    private LocalDateTime assignedDate;
    private LocalDateTime completedDate;
    private String progressNotes;
    private String proofImageUrl;
}
