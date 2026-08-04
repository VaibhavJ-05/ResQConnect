package com.resqconnect.disasteremergency.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissingPersonDto {
    private String id;
    private Integer reporterId;
    private String reporterName;
    private String reporterPhone;
    private String name;
    private Integer age;
    private String gender;
    private String photo;
    private String lastSeenLocation;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
