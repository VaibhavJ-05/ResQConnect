package com.resqconnect.disasteremergency.services;

import com.resqconnect.disasteremergency.dtos.*;
import java.util.Map;

public interface DisasterService {
    PagedResult<DisasterDto> getDisastersFiltered(
            String searchTerm, String type, String severity, String status,
            int pageNumber, int pageSize, String sortBy, boolean sortDescending);

    Map<String, Object> getDisasterStats();
    DisasterDto getDisasterById(String id);
    DisasterDto createDisaster(CreateDisasterDto createDto, Integer createdByUserId);
    DisasterDto updateDisaster(String id, CreateDisasterDto updateDto);
    boolean closeDisaster(String id);
    boolean deleteDisaster(String id);
}
