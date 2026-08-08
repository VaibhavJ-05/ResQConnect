package com.resqconnect.identitycamp.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDto {
    private Integer id;
    private Integer campId;
    private String campName;
    private String name;
    private Integer quantity;
    private String unit;
    private Integer thresholdQuantity;
    private LocalDateTime updatedAt;

    public boolean getIsLowStock() {
        return this.quantity != null && this.thresholdQuantity != null && this.quantity <= this.thresholdQuantity;
    }
}
