package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import java.util.List;

public interface CampService {
    List<ReliefCampDto> getAllCamps();
    List<ReliefCampDto> getCampsByDisasterId(String disasterId);
    ReliefCampDto getCampById(Integer id);
    ReliefCampDto createCamp(CreateCampDto createDto);
    ReliefCampDto updateCamp(Integer id, CreateCampDto updateDto);
    boolean closeCamp(Integer id);
}
