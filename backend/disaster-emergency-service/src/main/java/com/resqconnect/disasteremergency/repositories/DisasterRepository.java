package com.resqconnect.disasteremergency.repositories;

import com.resqconnect.disasteremergency.models.Disaster;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DisasterRepository extends MongoRepository<Disaster, String> {
    List<Disaster> findByStatus(String status);
}
