package com.resqconnect.disasteremergency.repositories;

import com.resqconnect.disasteremergency.models.MissingPerson;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MissingPersonRepository extends MongoRepository<MissingPerson, String> {
    List<MissingPerson> findByReporterId(Integer reporterId);
    List<MissingPerson> findByStatus(String status);
}
