package com.resqconnect.disasteremergency.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "disasters")
@Data
@NoArgsConstructor
public class Disaster {
    @Id
    private String id;

    private String title;
    private String description;
    private String type; // Earthquake, Flood, Wildfire, Hurricane, etc.
    private String severity; // Low, Medium, High, Critical
    private String status; // Active, Contained, Closed
    private Double latitude;
    private Double longitude;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer createdBy; // MySQL User ID
    private LocalDateTime createdAt = LocalDateTime.now();
}
