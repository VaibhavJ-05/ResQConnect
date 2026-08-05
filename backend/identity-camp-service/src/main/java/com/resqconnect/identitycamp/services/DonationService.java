package com.resqconnect.identitycamp.services;

import com.resqconnect.identitycamp.dtos.*;
import java.util.List;

public interface DonationService {
    CreateOrderResponse createOrder(DonationRequest request, Integer donorId);
    DonationResponse verifyPayment(VerifyPaymentRequest request);
    List<DonationResponse> getMyDonations(Integer donorId);
    NgoDonationStats getNgoStats(Integer ngoId);
    AdminDonationStats getAdminStats();
}
