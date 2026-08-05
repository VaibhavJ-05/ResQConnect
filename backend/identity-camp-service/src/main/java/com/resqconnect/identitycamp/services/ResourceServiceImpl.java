package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.ReliefCamp;
import com.resqconnect.identitycamp.models.Resource;
import com.resqconnect.identitycamp.repositories.ReliefCampRepository;
import com.resqconnect.identitycamp.repositories.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ReliefCampRepository campRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository, ReliefCampRepository campRepository) {
        this.resourceRepository = resourceRepository;
        this.campRepository = campRepository;
    }

    @Override
    public List<ResourceDto> getResourcesByCampId(Integer campId) {
        return resourceRepository.findByCampId(campId)
                .stream()
                .map(this::mapToResourceDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDto getResourceById(Integer id) {
        return resourceRepository.findById(id)
                .map(this::mapToResourceDto)
                .orElse(null);
    }

    @Override
    public ResourceDto addResource(CreateResourceDto createDto) {
        Optional<ReliefCamp> campOpt = campRepository.findById(createDto.getCampId());
        if (campOpt.isEmpty()) {
            return null;
        }

        Resource res = new Resource();
        res.setCampId(createDto.getCampId());
        res.setName(createDto.getName());
        res.setQuantity(createDto.getQuantity());
        res.setUnit(createDto.getUnit());
        res.setThresholdQuantity(createDto.getThresholdQuantity());
        res.setUpdatedAt(LocalDateTime.now());

        Resource saved = resourceRepository.save(res);
        return mapToResourceDto(saved);
    }

    @Override
    public ResourceDto updateQuantity(Integer id, Integer quantity) {
        Optional<Resource> resOpt = resourceRepository.findById(id);
        if (resOpt.isEmpty()) {
            return null;
        }

        Resource res = resOpt.get();
        res.setQuantity(quantity);
        res.setUpdatedAt(LocalDateTime.now());

        Resource saved = resourceRepository.save(res);
        return mapToResourceDto(saved);
    }

    @Override
    public boolean deleteResource(Integer id) {
        Optional<Resource> resOpt = resourceRepository.findById(id);
        if (resOpt.isEmpty()) {
            return false;
        }
        resourceRepository.delete(resOpt.get());
        return true;
    }

    private ResourceDto mapToResourceDto(Resource res) {
        ResourceDto dto = new ResourceDto();
        dto.setId(res.getId());
        dto.setCampId(res.getCampId());
        dto.setName(res.getName());
        dto.setQuantity(res.getQuantity());
        dto.setUnit(res.getUnit());
        dto.setThresholdQuantity(res.getThresholdQuantity());
        dto.setUpdatedAt(res.getUpdatedAt());

        campRepository.findById(res.getCampId()).ifPresent(c -> {
            dto.setCampName(c.getName());
        });

        return dto;
    }
}
