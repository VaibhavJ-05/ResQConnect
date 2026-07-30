package com.resqconnect.disasteremergency.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisasterDto {
    private String id;
    private String title;
    private String description;
    private String type;
    private String severity;
    private String status;
    private Double latitude;
    private Double longitude;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer createdBy;
    private String creatorName;
    private LocalDateTime createdAt;
}
