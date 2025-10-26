package com.servicefinder.repository;

import com.servicefinder.model.Booking;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by customer
    Page<Booking> findByCustomerOrderByScheduledDateTimeDesc(User customer, Pageable pageable);
    
    List<Booking> findByCustomerAndStatusOrderByScheduledDateTimeDesc(User customer, BookingStatus status);

    // Find bookings by service provider
    Page<Booking> findByServiceProviderOrderByScheduledDateTimeDesc(ServiceProvider serviceProvider, Pageable pageable);
    
    List<Booking> findByServiceProviderAndStatusOrderByScheduledDateTimeDesc(ServiceProvider serviceProvider, BookingStatus status);

    // Find bookings by status
    Page<Booking> findByStatusOrderByScheduledDateTimeDesc(BookingStatus status, Pageable pageable);

    // Find bookings by date range
    @Query("SELECT b FROM Booking b WHERE b.scheduledDateTime BETWEEN :startDate AND :endDate ORDER BY b.scheduledDateTime ASC")
    List<Booking> findBookingsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find customer's upcoming bookings
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND b.scheduledDateTime > :now AND b.status NOT IN ('CANCELLED', 'COMPLETED') ORDER BY b.scheduledDateTime ASC")
    List<Booking> findUpcomingBookingsByCustomer(@Param("customer") User customer, @Param("now") LocalDateTime now);

    // Find provider's upcoming bookings
    @Query("SELECT b FROM Booking b WHERE b.serviceProvider = :provider AND b.scheduledDateTime > :now AND b.status NOT IN ('CANCELLED', 'COMPLETED') ORDER BY b.scheduledDateTime ASC")
    List<Booking> findUpcomingBookingsByProvider(@Param("provider") ServiceProvider provider, @Param("now") LocalDateTime now);

    // Find provider's bookings for a specific date
    @Query("SELECT b FROM Booking b WHERE b.serviceProvider = :provider AND DATE(b.scheduledDateTime) = DATE(:date) AND b.status != 'CANCELLED' ORDER BY b.scheduledDateTime ASC")
    List<Booking> findProviderBookingsForDate(@Param("provider") ServiceProvider provider, @Param("date") LocalDateTime date);

    // Check for booking conflicts
    @Query("SELECT b FROM Booking b WHERE b.serviceProvider = :provider AND b.status NOT IN ('CANCELLED', 'COMPLETED') AND " +
           "((b.scheduledDateTime <= :endTime AND b.estimatedEndDateTime >= :startTime) OR " +
           "(b.scheduledDateTime <= :endTime AND b.scheduledDateTime >= :startTime))")
    List<Booking> findConflictingBookings(@Param("provider") ServiceProvider provider, 
                                        @Param("startTime") LocalDateTime startTime, 
                                        @Param("endTime") LocalDateTime endTime);

    // Find bookings that can be rated (completed but not yet rated)
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND b.status = 'COMPLETED' AND " +
           "NOT EXISTS (SELECT r FROM Rating r WHERE r.booking = b)")
    List<Booking> findCompletedBookingsWithoutRating(@Param("customer") User customer);

    // Find recent bookings (last 30 days)
    @Query("SELECT b FROM Booking b WHERE b.scheduledDateTime >= :thirtyDaysAgo ORDER BY b.scheduledDateTime DESC")
    List<Booking> findRecentBookings(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

    // Provider statistics
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.serviceProvider = :provider AND b.status = 'COMPLETED'")
    Long countCompletedBookingsByProvider(@Param("provider") ServiceProvider provider);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.serviceProvider = :provider AND b.status = 'CANCELLED'")
    Long countCancelledBookingsByProvider(@Param("provider") ServiceProvider provider);

    // Customer statistics  
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.customer = :customer AND b.status = 'COMPLETED'")
    Long countCompletedBookingsByCustomer(@Param("customer") User customer);

    // Find bookings by service
    @Query("SELECT b FROM Booking b WHERE b.service.id = :serviceId ORDER BY b.scheduledDateTime DESC")
    Page<Booking> findBookingsByServiceId(@Param("serviceId") Long serviceId, Pageable pageable);
} 