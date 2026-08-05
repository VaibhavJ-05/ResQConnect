package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.ReliefCamp;
import com.resqconnect.identitycamp.repositories.ReliefCampRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CampServiceImpl implements CampService {

    private final ReliefCampRepository campRepository;
    private final DisasterEmergencyClient disasterEmergencyClient;

    public CampServiceImpl(ReliefCampRepository campRepository, 
                           DisasterEmergencyClient disasterEmergencyClient) {
        this.campRepository = campRepository;
        this.disasterEmergencyClient = disasterEmergencyClient;
    }

    @Override
    public List<ReliefCampDto> getAllCamps() {
        return campRepository.findAll()
                .stream()
                .map(this::mapToReliefCampDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReliefCampDto> getCampsByDisasterId(String disasterId) {
        return campRepository.findByDisasterId(disasterId)
                .stream()
                .map(this::mapToReliefCampDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReliefCampDto getCampById(Integer id) {
        return campRepository.findById(id)
                .map(this::mapToReliefCampDto)
                .orElse(null);
    }

    @Override
    public ReliefCampDto createCamp(CreateCampDto createDto) {
        ReliefCamp camp = new ReliefCamp();
        camp.setDisasterId(createDto.getDisasterId());
        camp.setName(createDto.getName());
        camp.setAddress(createDto.getAddress());
        camp.setLatitude(createDto.getLatitude());
        camp.setLongitude(createDto.getLongitude());
        camp.setCapacity(createDto.getCapacity());
        camp.setCurrentOccupancy(createDto.getCurrentOccupancy());
        camp.setContactPerson(createDto.getContactPerson());
        camp.setContactNumber(createDto.getContactNumber());

        ReliefCamp saved = campRepository.save(camp);
        return mapToReliefCampDto(saved);
    }

    @Override
    public ReliefCampDto updateCamp(Integer id, CreateCampDto updateDto) {
        Optional<ReliefCamp> campOpt = campRepository.findById(id);
        if (campOpt.isEmpty()) {
            return null;
        }

        ReliefCamp camp = campOpt.get();
        camp.setDisasterId(updateDto.getDisasterId());
        camp.setName(updateDto.getName());
        camp.setAddress(updateDto.getAddress());
        camp.setLatitude(updateDto.getLatitude());
        camp.setLongitude(updateDto.getLongitude());
        camp.setCapacity(updateDto.getCapacity());
        camp.setCurrentOccupancy(updateDto.getCurrentOccupancy());
        camp.setContactPerson(updateDto.getContactPerson());
        camp.setContactNumber(updateDto.getContactNumber());

        ReliefCamp saved = campRepository.save(camp);
        return mapToReliefCampDto(saved);
    }

    @Override
    public boolean closeCamp(Integer id) {
        Optional<ReliefCamp> campOpt = campRepository.findById(id);
        if (campOpt.isEmpty()) {
            return false;
        }
        campRepository.delete(campOpt.get());
        return true;
    }

    private ReliefCampDto mapToReliefCampDto(ReliefCamp camp) {
        ReliefCampDto dto = new ReliefCampDto();
        dto.setId(camp.getId());
        dto.setDisasterId(camp.getDisasterId());
        dto.setName(camp.getName());
        dto.setAddress(camp.getAddress());
        dto.setLatitude(camp.getLatitude());
        dto.setLongitude(camp.getLongitude());
        dto.setCapacity(camp.getCapacity());
        dto.setCurrentOccupancy(camp.getCurrentOccupancy());
        dto.setContactPerson(camp.getContactPerson());
        dto.setContactNumber(camp.getContactNumber());

        // Dynamic disaster details retrieval
        if (camp.getDisasterId() != null && !camp.getDisasterId().trim().isEmpty()) {
            try {
                DisasterDto disaster = disasterEmergencyClient.getDisasterById(camp.getDisasterId());
                if (disaster != null) {
                    dto.setDisasterTitle(disaster.getTitle());
                }
            } catch (Exception e) {
                // Fallback in case the Disaster service is unavailable or disaster ID doesn't exist yet
                dto.setDisasterTitle("Unknown/Inactive Disaster");
            }
        } else {
            dto.setDisasterTitle("None");
        }

        return dto;
    }
}
