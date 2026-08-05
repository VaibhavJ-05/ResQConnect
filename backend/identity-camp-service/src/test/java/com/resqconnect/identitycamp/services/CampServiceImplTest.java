package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.models.ReliefCamp;
import com.resqconnect.identitycamp.repositories.ReliefCampRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CampServiceImplTest {

    @Mock
    private ReliefCampRepository campRepository;

    @Mock
    private DisasterEmergencyClient disasterEmergencyClient;

    @InjectMocks
    private CampServiceImpl campService;

    private ReliefCamp mockCamp;

    @BeforeEach
    public void setup() {
        mockCamp = new ReliefCamp();
        mockCamp.setId(1);
        mockCamp.setName("Camp Hope");
        mockCamp.setDisasterId("dis-123");
        mockCamp.setAddress("Greenfield Ground");
        mockCamp.setLatitude(12.3456);
        mockCamp.setLongitude(78.9012);
        mockCamp.setCapacity(500);
        mockCamp.setCurrentOccupancy(120);
        mockCamp.setContactPerson("John Doe");
        mockCamp.setContactNumber("9876543210");
    }

    @Test
    public void testGetCampById_Success() {
        // Arrange
        when(campRepository.findById(1)).thenReturn(Optional.of(mockCamp));
        
        DisasterDto mockDisaster = new DisasterDto();
        mockDisaster.setId("dis-123");
        mockDisaster.setTitle("Monsoon Floods");
        when(disasterEmergencyClient.getDisasterById("dis-123")).thenReturn(mockDisaster);

        // Act
        ReliefCampDto result = campService.getCampById(1);

        // Assert
        assertNotNull(result);
        assertEquals("Camp Hope", result.getName());
        assertEquals("Monsoon Floods", result.getDisasterTitle());
        verify(campRepository, times(1)).findById(1);
        verify(disasterEmergencyClient, times(1)).getDisasterById("dis-123");
    }

    @Test
    public void testGetCampById_NotFound() {
        // Arrange
        when(campRepository.findById(99)).thenReturn(Optional.empty());

        // Act
        ReliefCampDto result = campService.getCampById(99);

        // Assert
        assertNull(result);
        verify(campRepository, times(1)).findById(99);
        verifyNoInteractions(disasterEmergencyClient);
    }
}
