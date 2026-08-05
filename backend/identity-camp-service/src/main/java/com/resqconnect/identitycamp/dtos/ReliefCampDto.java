package com.resqconnect.identitycamp.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReliefCampDto {
    private Integer id;
    private String disasterId;
    private String disasterTitle;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private Integer currentOccupancy;
    private String contactPerson;
    private String contactNumber;
}
