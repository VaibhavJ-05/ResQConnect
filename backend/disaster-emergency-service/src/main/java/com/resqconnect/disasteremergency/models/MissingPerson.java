package com.resqconnect.disasteremergency.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "missing_persons")
@Data
@NoArgsConstructor
public class MissingPerson {
    @Id
    private String id;

    private Integer reporterId; // MySQL User ID
    private String name;
    private Integer age;
    private String gender;
    private String photo; // Image file path or URL
    private String lastSeenLocation;
    private String description;
    private String status = "Missing"; // Missing, Found
    private LocalDateTime createdAt = LocalDateTime.now();
}
