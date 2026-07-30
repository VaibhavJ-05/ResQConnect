package com.resqconnect.disasteremergency.services;

import com.resqconnect.disasteremergency.config.RabbitMQConfig;
import com.resqconnect.disasteremergency.dtos.*;
import com.resqconnect.disasteremergency.models.*;
import com.resqconnect.disasteremergency.repositories.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DisasterServiceImpl implements DisasterService {

    private final DisasterRepository disasterRepository;
    private final NotificationRepository notificationRepository;
    private final IdentityCampClient identityCampClient;
    private final MongoTemplate mongoTemplate;
    private final RabbitTemplate rabbitTemplate;

    public DisasterServiceImpl(DisasterRepository disasterRepository,
                               NotificationRepository notificationRepository,
                               IdentityCampClient identityCampClient,
                               MongoTemplate mongoTemplate,
                               RabbitTemplate rabbitTemplate) {
        this.disasterRepository = disasterRepository;
        this.notificationRepository = notificationRepository;
        this.identityCampClient = identityCampClient;
        this.mongoTemplate = mongoTemplate;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public PagedResult<DisasterDto> getDisastersFiltered(
            String searchTerm, String type, String severity, String status,
            int pageNumber, int pageSize, String sortBy, boolean sortDescending) {

        Query query = new Query();

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            query.addCriteria(new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("description").regex(searchTerm, "i"),
                Criteria.where("location").regex(searchTerm, "i")
            ));
        }

        if (type != null && !type.trim().isEmpty()) {
            query.addCriteria(Criteria.where("type").is(type));
        }

        if (severity != null && !severity.trim().isEmpty()) {
            query.addCriteria(Criteria.where("severity").is(severity));
        }

        if (status != null && !status.trim().isEmpty()) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        long totalCount = mongoTemplate.count(query, Disaster.class);

        Sort sort = sortDescending ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        query.with(sort);

        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize);
        query.with(pageable);

        List<DisasterDto> items = mongoTemplate.find(query, Disaster.class)
                .stream()
                .map(this::mapToDisasterDto)
                .collect(Collectors.toList());

        return new PagedResult<>(items, totalCount, pageNumber, pageSize);
    }

    @Override
    public Map<String, Object> getDisasterStats() {
        List<Disaster> disasters = disasterRepository.findAll();
        long total = disasters.size();
        long active = disasters.stream().filter(d -> "Active".equalsIgnoreCase(d.getStatus())).count();
        long closed = disasters.stream().filter(d -> "Closed".equalsIgnoreCase(d.getStatus())).count();

        List<DisasterDto> latest = disasters.stream()
                .sorted(Comparator.comparing(Disaster::getCreatedAt).reversed())
                .limit(5)
                .map(this::mapToDisasterDto)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("TotalDisasters", total);
        stats.put("ActiveDisasters", active);
        stats.put("ClosedDisasters", closed);
        stats.put("LatestDisasters", latest);

        return stats;
    }

    @Override
    public DisasterDto getDisasterById(String id) {
        return disasterRepository.findById(id)
                .map(this::mapToDisasterDto)
                .orElse(null);
    }

    @Override
    public DisasterDto createDisaster(CreateDisasterDto createDto, Integer createdByUserId) {
        Disaster disaster = new Disaster();
        disaster.setTitle(createDto.getTitle());
        disaster.setDescription(createDto.getDescription());
        disaster.setType(createDto.getType());
        disaster.setSeverity(createDto.getSeverity());
        disaster.setStatus(createDto.getStatus());
        disaster.setLatitude(createDto.getLatitude());
        disaster.setLongitude(createDto.getLongitude());
        disaster.setStartDate(createDto.getStartDate());
        disaster.setEndDate(createDto.getEndDate());
        disaster.setCreatedBy(createdByUserId);
        disaster.setCreatedAt(LocalDateTime.now());

        Disaster saved = disasterRepository.save(disaster);

        // Record Broadcast Notification
        Notification notification = new Notification();
        notification.setTitle("URGENT: New Disaster Alert - " + saved.getTitle());
        notification.setMessage("A new " + saved.getType() + " (" + saved.getSeverity() + " severity) has been logged. Please stay safe and check active camps for shelter. Details: " + saved.getDescription() + ".");
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        // Publish event to RabbitMQ
        try {
            DisasterCreatedEvent event = new DisasterCreatedEvent(
                    saved.getId(), saved.getTitle(), saved.getType(), saved.getSeverity(), saved.getDescription(), saved.getCreatedAt()
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "disaster.event.created", event);
        } catch (Exception e) {
            // Log RabbitMQ failure but do not roll back disaster registration
            System.err.println("RabbitMQ error: " + e.getMessage());
        }

        return mapToDisasterDto(saved);
    }

    @Override
    public DisasterDto updateDisaster(String id, CreateDisasterDto updateDto) {
        Optional<Disaster> opt = disasterRepository.findById(id);
        if (opt.isEmpty()) return null;

        Disaster disaster = opt.get();
        disaster.setTitle(updateDto.getTitle());
        disaster.setDescription(updateDto.getDescription());
        disaster.setType(updateDto.getType());
        disaster.setSeverity(updateDto.getSeverity());
        disaster.setStatus(updateDto.getStatus());
        disaster.setLatitude(updateDto.getLatitude());
        disaster.setLongitude(updateDto.getLongitude());
        disaster.setStartDate(updateDto.getStartDate());
        disaster.setEndDate(updateDto.getEndDate());

        Disaster saved = disasterRepository.save(disaster);
        return mapToDisasterDto(saved);
    }

    @Override
    public boolean closeDisaster(String id) {
        Optional<Disaster> opt = disasterRepository.findById(id);
        if (opt.isEmpty()) return false;

        Disaster disaster = opt.get();
        disaster.setStatus("Closed");
        disaster.setEndDate(LocalDateTime.now());
        disasterRepository.save(disaster);

        // Record Broadcast Notification
        Notification notification = new Notification();
        notification.setTitle("Advisory Update: Disaster Resolved");
        notification.setMessage("The disaster '" + disaster.getTitle() + "' has been marked as closed/contained. Relief camps may begin transitioning.");
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        return true;
    }

    @Override
    public boolean deleteDisaster(String id) {
        Optional<Disaster> opt = disasterRepository.findById(id);
        if (opt.isEmpty()) return false;

        disasterRepository.delete(opt.get());
        return true;
    }

    private DisasterDto mapToDisasterDto(Disaster disaster) {
        DisasterDto dto = new DisasterDto();
        dto.setId(disaster.getId());
        dto.setTitle(disaster.getTitle());
        dto.setDescription(disaster.getDescription());
        dto.setType(disaster.getType());
        dto.setSeverity(disaster.getSeverity());
        dto.setStatus(disaster.getStatus());
        dto.setLatitude(disaster.getLatitude());
        dto.setLongitude(disaster.getLongitude());
        dto.setStartDate(disaster.getStartDate());
        dto.setEndDate(disaster.getEndDate());
        dto.setCreatedBy(disaster.getCreatedBy());
        dto.setCreatedAt(disaster.getCreatedAt());

        if (disaster.getCreatedBy() != null) {
            try {
                UserDto user = identityCampClient.getUserById(disaster.getCreatedBy());
                if (user != null) {
                    dto.setCreatorName(user.getName());
                }
            } catch (Exception e) {
                dto.setCreatorName("System Officer");
            }
        } else {
            dto.setCreatorName("System");
        }

        return dto;
    }
}
