package com.resqconnect.identitycamp.repositories;

import com.resqconnect.identitycamp.models.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Integer> {
    
    Optional<Donation> findByOrderId(String orderId);

    List<Donation> findByDonorIdOrderByCreatedAtDesc(Integer donorId);

    List<Donation> findByNgoIdAndPaymentStatusOrderByCreatedAtDesc(Integer ngoId, String paymentStatus);

    List<Donation> findFirst5ByNgoIdAndPaymentStatusOrderByCreatedAtDesc(Integer ngoId, String paymentStatus);

    List<Donation> findFirst10ByOrderByCreatedAtDesc();

    List<Donation> findFirst10ByPaymentStatusOrderByCreatedAtDesc(String paymentStatus);

    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Donation d WHERE d.ngo.id = :ngoId AND d.paymentStatus = 'SUCCESS'")
    Double sumAmountByNgoIdAndSuccessStatus(@Param("ngoId") Integer ngoId);

    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Donation d WHERE d.ngo.id = :ngoId AND d.paymentStatus = 'SUCCESS' AND d.createdAt >= :startDate")
    Double sumAmountByNgoIdAndSuccessStatusAndCreatedAtAfter(@Param("ngoId") Integer ngoId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Donation d WHERE d.paymentStatus = 'SUCCESS'")
    Double sumAllSuccessDonations();

    @Query("SELECT d.ngo.id, d.ngo.name, COALESCE(SUM(d.amount), 0.0) FROM Donation d WHERE d.paymentStatus = 'SUCCESS' GROUP BY d.ngo.id, d.ngo.name")
    List<Object[]> sumDonationsGroupByNgo();
}
