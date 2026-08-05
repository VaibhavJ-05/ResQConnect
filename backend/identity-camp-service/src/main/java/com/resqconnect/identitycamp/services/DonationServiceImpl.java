package com.resqconnect.identitycamp.services;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.resqconnect.identitycamp.dtos.*;
import com.resqconnect.identitycamp.exceptions.ResourceNotFoundException;
import com.resqconnect.identitycamp.models.Donation;
import com.resqconnect.identitycamp.models.User;
import com.resqconnect.identitycamp.repositories.DonationRepository;
import com.resqconnect.identitycamp.repositories.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    public DonationServiceImpl(DonationRepository donationRepository, UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CreateOrderResponse createOrder(DonationRequest request, Integer donorId) {
        // Validate donor if logged in
        User donor = null;
        if (donorId != null) {
            donor = userRepository.findById(donorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Donor not found."));
        }

        // Validate NGO
        User ngo = userRepository.findById(request.getNgoId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found."));

        if (ngo.getRoleId() != 3) {
            throw new IllegalArgumentException("Selected user is not an NGO.");
        }

        // Prevent NGO from donating to themselves
        if (donorId != null && donorId.equals(request.getNgoId()) && donor != null && donor.getRoleId() == 3) {
            throw new IllegalArgumentException("NGOs cannot donate to themselves.");
        }

        // 1. Save Pending Donation record in local database
        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setNgo(ngo);
        donation.setAmount(request.getAmount());
        donation.setAnonymous(request.getAnonymous());
        donation.setMessage(request.getMessage());
        donation.setPaymentStatus("PENDING");
        donation.setCreatedAt(LocalDateTime.now());
        donation.setOrderId("TEMP_ORDER_ID"); // temporary until created via SDK

        donation = donationRepository.save(donation);

        try {
            // 2. Call Razorpay API to create order
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            int amountInPaise = (int) Math.round(request.getAmount() * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + donation.getId());

            JSONObject notes = new JSONObject();
            notes.put("donationId", donation.getId().toString());
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);
            String rzpOrderId = order.get("id");

            // 3. Update local donation record with Razorpay Order ID
            donation.setOrderId(rzpOrderId);
            donationRepository.save(donation);

            return new CreateOrderResponse(
                    rzpOrderId,
                    amountInPaise,
                    "INR",
                    razorpayKeyId,
                    donation.getId()
            );

        } catch (Exception e) {
            // Mark payment as failed in case of Razorpay error
            donation.setPaymentStatus("FAILED");
            donation.setMessage(donation.getMessage() + " (Failed to initialize: " + e.getMessage() + ")");
            donationRepository.save(donation);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    public DonationResponse verifyPayment(VerifyPaymentRequest request) {
        // Fetch matching donation
        Donation donation = donationRepository.findByOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation record not found for Order ID: " + request.getRazorpayOrderId()));

        // Reject duplicate verification requests
        if ("SUCCESS".equalsIgnoreCase(donation.getPaymentStatus())) {
            throw new IllegalStateException("Payment already verified successfully.");
        }

        // Verify cryptographic signature
        boolean isValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                razorpayKeySecret
        );

        if (isValid) {
            donation.setPaymentStatus("SUCCESS");
            donation.setPaymentId(request.getRazorpayPaymentId());
            donation.setSignature(request.getRazorpaySignature());
            donationRepository.save(donation);
            return mapToDonationResponse(donation);
        } else {
            donation.setPaymentStatus("FAILED");
            donation.setPaymentId(request.getRazorpayPaymentId());
            donation.setSignature(request.getRazorpaySignature());
            donationRepository.save(donation);
            throw new IllegalArgumentException("Signature verification failed. Potential tampering detected.");
        }
    }

    @Override
    public List<DonationResponse> getMyDonations(Integer donorId) {
        return donationRepository.findByDonorIdOrderByCreatedAtDesc(donorId)
                .stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NgoDonationStats getNgoStats(Integer ngoId) {
        User ngo = userRepository.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found."));
        if (ngo.getRoleId() != 3) {
            throw new IllegalArgumentException("User is not an NGO.");
        }

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);

        Double total = donationRepository.sumAmountByNgoIdAndSuccessStatus(ngoId);
        Double today = donationRepository.sumAmountByNgoIdAndSuccessStatusAndCreatedAtAfter(ngoId, startOfToday);
        Double monthly = donationRepository.sumAmountByNgoIdAndSuccessStatusAndCreatedAtAfter(ngoId, startOfMonth);

        List<DonationResponse> recent = donationRepository.findFirst5ByNgoIdAndPaymentStatusOrderByCreatedAtDesc(ngoId, "SUCCESS")
                .stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());

        return new NgoDonationStats(total, today, monthly, recent);
    }

    @Override
    public AdminDonationStats getAdminStats() {
        Double total = donationRepository.sumAllSuccessDonations();

        List<Object[]> rawGroupStats = donationRepository.sumDonationsGroupByNgo();
        List<AdminDonationStats.NgoDonationEntry> donationsPerNgo = new ArrayList<>();
        for (Object[] row : rawGroupStats) {
            donationsPerNgo.add(new AdminDonationStats.NgoDonationEntry(
                    (Integer) row[0],
                    (String) row[1],
                    (Double) row[2]
            ));
        }

        List<DonationResponse> recentTransactions = donationRepository.findFirst10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());

        List<DonationResponse> failedPayments = donationRepository.findFirst10ByPaymentStatusOrderByCreatedAtDesc("FAILED")
                .stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());

        return new AdminDonationStats(total, donationsPerNgo, recentTransactions, failedPayments);
    }

    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        try {
            String data = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private DonationResponse mapToDonationResponse(Donation d) {
        DonationResponse res = new DonationResponse();
        res.setId(d.getId());
        res.setNgoId(d.getNgo().getId());
        res.setNgoName(d.getNgo().getName());
        res.setAmount(d.getAmount());
        res.setPaymentId(d.getPaymentId());
        res.setOrderId(d.getOrderId());
        res.setAnonymous(d.getAnonymous());
        res.setMessage(d.getMessage());
        res.setPaymentStatus(d.getPaymentStatus());
        res.setCreatedAt(d.getCreatedAt());

        if (d.getDonor() == null) {
            res.setDonorId(null);
            res.setDonorName(d.getAnonymous() ? "Anonymous Guest" : "Guest Donor");
        } else if (d.getAnonymous()) {
            res.setDonorId(null);
            res.setDonorName("Anonymous Donor");
        } else {
            res.setDonorId(d.getDonor().getId());
            res.setDonorName(d.getDonor().getName());
        }

        return res;
    }
}
