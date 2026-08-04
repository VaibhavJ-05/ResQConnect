package com.resqconnect.disasteremergency.services;

import com.resqconnect.disasteremergency.dtos.*;
import java.util.List;

public interface MissingPersonService {
    List<MissingPersonDto> getAllMissingPersons();
    MissingPersonDto getMissingPersonById(String id);
    MissingPersonDto reportMissingPerson(CreateMissingPersonDto createDto, Integer reporterId);
    MissingPersonDto updateStatus(String id, String status, Integer userId, String role);
}
