package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import java.util.List;

public interface ResourceService {
    List<ResourceDto> getResourcesByCampId(Integer campId);
    ResourceDto getResourceById(Integer id);
    ResourceDto addResource(CreateResourceDto createDto);
    ResourceDto updateQuantity(Integer id, Integer quantity);
    boolean deleteResource(Integer id);
}
