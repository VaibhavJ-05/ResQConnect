package com.resqconnect.identitycamp.repositories;

import com.resqconnect.identitycamp.models.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Integer> {
    List<Resource> findByCampId(Integer campId);
}
