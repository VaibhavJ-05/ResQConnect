package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.DisasterDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "disaster-emergency-service")
public interface DisasterEmergencyClient {

    @GetMapping("/api/disasters/{id}")
    DisasterDto getDisasterById(@PathVariable("id") String id);
}
