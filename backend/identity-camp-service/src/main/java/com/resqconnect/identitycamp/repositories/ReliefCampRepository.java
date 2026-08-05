package com.resqconnect.identitycamp.repositories;

import com.resqconnect.identitycamp.models.ReliefCamp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReliefCampRepository extends JpaRepository<ReliefCamp, Integer> {
    List<ReliefCamp> findByDisasterId(String disasterId);
}
