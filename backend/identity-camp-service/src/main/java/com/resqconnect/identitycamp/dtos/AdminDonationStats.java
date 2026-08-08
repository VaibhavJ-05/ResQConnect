package com.resqconnect.identitycamp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDonationStats {
    private Double totalDonations;
    private List<NgoDonationEntry> donationsPerNgo;
    private List<DonationResponse> recentTransactions;
    private List<DonationResponse> failedPayments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NgoDonationEntry {
        private Integer ngoId;
        private String ngoName;
        private Double totalAmount;
    }
}
