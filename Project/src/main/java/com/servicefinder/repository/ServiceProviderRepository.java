package com.servicefinder.repository;

import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    
    Optional<ServiceProvider> findByUser(User user);
    
    Optional<ServiceProvider> findByUserId(Long userId);
    
    List<ServiceProvider> findByAvailableTrue();
    
    List<ServiceProvider> findByVerificationStatus(VerificationStatus status);
    
    List<ServiceProvider> findByVerificationStatusAndAvailableTrue(VerificationStatus status);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.averageRating >= :minRating AND sp.available = true")
    List<ServiceProvider> findByMinimumRating(@Param("minRating") BigDecimal minRating);
    
    @Query("SELECT sp FROM ServiceProvider sp JOIN sp.user u WHERE " +
           "sp.available = true AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(u.latitude)))) <= :radiusKm")
    List<ServiceProvider> findProvidersWithinRadius(@Param("latitude") Double latitude, 
                                                   @Param("longitude") Double longitude, 
                                                   @Param("radiusKm") Double radiusKm);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE " +
           "sp.available = true AND " +
           "(sp.businessName LIKE %:keyword% OR sp.description LIKE %:keyword%)")
    List<ServiceProvider> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.available = true ORDER BY sp.averageRating DESC")
    List<ServiceProvider> findTopRatedProviders();
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.available = true ORDER BY sp.totalBookings DESC")
    List<ServiceProvider> findMostBookedProviders();
} 