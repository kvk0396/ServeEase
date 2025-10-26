package com.servicefinder.repository;

import com.servicefinder.model.Availability;
import com.servicefinder.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    // Find by service provider
    List<Availability> findByServiceProviderOrderByStartDateTimeAsc(ServiceProvider serviceProvider);
    
    // Find available slots for a provider
    List<Availability> findByServiceProviderAndIsBookedFalseOrderByStartDateTimeAsc(ServiceProvider serviceProvider);
    
    // Find available slots within date range
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND a.isBooked = false " +
           "AND a.startDateTime >= :startDate " +
           "AND a.endDateTime <= :endDate " +
           "ORDER BY a.startDateTime")
    List<Availability> findAvailableSlotsByProviderAndDateRange(
        @Param("provider") ServiceProvider provider,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Find conflicting slots
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND ((a.startDateTime < :endDateTime AND a.endDateTime > :startDateTime))")
    List<Availability> findConflictingSlots(
        @Param("provider") ServiceProvider provider,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime
    );
    
    // Find available slots for a specific time duration
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND a.isBooked = false " +
           "AND a.startDateTime >= :searchStart " +
           "AND a.endDateTime <= :searchEnd " +
           "AND TIMESTAMPDIFF(MINUTE, a.startDateTime, a.endDateTime) >= :durationMinutes " +
           "ORDER BY a.startDateTime")
    List<Availability> findAvailableSlotsForDuration(
        @Param("provider") ServiceProvider provider,
        @Param("searchStart") LocalDateTime searchStart,
        @Param("searchEnd") LocalDateTime searchEnd,
        @Param("durationMinutes") int durationMinutes
    );
    
    // Find recurring availability
    List<Availability> findByServiceProviderAndIsRecurringTrueAndDayOfWeek(
        ServiceProvider serviceProvider, DayOfWeek dayOfWeek
    );
    
    // Find all available slots across multiple providers within date range
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider IN :providers " +
           "AND a.isBooked = false " +
           "AND a.startDateTime >= :startDate " +
           "AND a.startDateTime <= :endDate " +
           "ORDER BY a.startDateTime")
    List<Availability> findAvailableSlotsByProvidersAndDate(
        @Param("providers") List<ServiceProvider> providers,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Find providers with availability on specific date
    @Query("SELECT DISTINCT a.serviceProvider FROM Availability a WHERE " +
           "a.isBooked = false " +
           "AND DATE(a.startDateTime) = DATE(:targetDate)")
    List<ServiceProvider> findProvidersWithAvailabilityOnDate(@Param("targetDate") LocalDateTime targetDate);
    
    // Check if provider has any availability in date range
    @Query("SELECT COUNT(a) > 0 FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND a.isBooked = false " +
           "AND a.startDateTime >= :startDate " +
           "AND a.endDateTime <= :endDate")
    boolean hasAvailabilityInRange(
        @Param("provider") ServiceProvider provider,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Find upcoming available slots (next 7 days)
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND a.isBooked = false " +
           "AND a.startDateTime >= :now " +
           "AND a.startDateTime <= :futureDate " +
           "ORDER BY a.startDateTime")
    List<Availability> findUpcomingAvailableSlots(
        @Param("provider") ServiceProvider provider,
        @Param("now") LocalDateTime now,
        @Param("futureDate") LocalDateTime futureDate
    );
    
    // Find booked slots for a provider
    List<Availability> findByServiceProviderAndIsBookedTrueOrderByStartDateTimeAsc(ServiceProvider serviceProvider);
    
    // Find slots by date range regardless of booking status
    @Query("SELECT a FROM Availability a WHERE a.serviceProvider = :provider " +
           "AND a.startDateTime >= :startDate " +
           "AND a.endDateTime <= :endDate " +
           "ORDER BY a.startDateTime")
    List<Availability> findSlotsByProviderAndDateRange(
        @Param("provider") ServiceProvider provider,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
} 