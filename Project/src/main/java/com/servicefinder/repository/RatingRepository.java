package com.servicefinder.repository;

import com.servicefinder.model.Rating;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    // Find ratings by service provider
    Page<Rating> findByServiceProviderOrderByCreatedAtDesc(ServiceProvider serviceProvider, Pageable pageable);
    
    List<Rating> findByServiceProviderOrderByCreatedAtDesc(ServiceProvider serviceProvider);

    // Find ratings by user (customer)
    Page<Rating> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Rating> findByUserOrderByCreatedAtDesc(User user);

    // Find rating by specific booking
    Optional<Rating> findByBooking(Booking booking);

    // Check if user has already rated a booking
    boolean existsByBooking(Booking booking);

    // Find ratings with reviews (non-empty reviews)
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider = :provider AND r.review IS NOT NULL AND TRIM(r.review) != '' ORDER BY r.createdAt DESC")
    Page<Rating> findRatingsWithReviewsByProvider(@Param("provider") ServiceProvider provider, Pageable pageable);

    // Find recent ratings (last 30 days)
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider = :provider AND r.createdAt >= :sinceDate ORDER BY r.createdAt DESC")
    List<Rating> findRecentRatingsByProvider(@Param("provider") ServiceProvider provider, @Param("sinceDate") java.time.LocalDateTime sinceDate);

    // Calculate average rating for a service provider
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.serviceProvider = :provider")
    BigDecimal calculateAverageRatingByProvider(@Param("provider") ServiceProvider provider);

    // Count total ratings for a service provider
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.serviceProvider = :provider")
    Long countRatingsByProvider(@Param("provider") ServiceProvider provider);

    // Find ratings by rating value range
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider = :provider AND r.rating >= :minRating AND r.rating <= :maxRating ORDER BY r.createdAt DESC")
    List<Rating> findRatingsByProviderAndRatingRange(@Param("provider") ServiceProvider provider, 
                                                    @Param("minRating") BigDecimal minRating, 
                                                    @Param("maxRating") BigDecimal maxRating);

    // Find most helpful reviews
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider = :provider AND r.review IS NOT NULL AND TRIM(r.review) != '' ORDER BY r.helpfulCount DESC, r.createdAt DESC")
    Page<Rating> findMostHelpfulReviewsByProvider(@Param("provider") ServiceProvider provider, Pageable pageable);

    // Get rating distribution for a provider
    @Query("SELECT r.rating, COUNT(r) FROM Rating r WHERE r.serviceProvider = :provider GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByProvider(@Param("provider") ServiceProvider provider);

    // Find top-rated service providers
    @Query("SELECT r.serviceProvider, AVG(r.rating) as avgRating FROM Rating r GROUP BY r.serviceProvider HAVING COUNT(r) >= :minRatings ORDER BY avgRating DESC")
    List<Object[]> findTopRatedProviders(@Param("minRatings") Long minRatings, Pageable pageable);

    // Search ratings by review content
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider = :provider AND LOWER(r.review) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY r.createdAt DESC")
    List<Rating> searchReviewsByKeyword(@Param("provider") ServiceProvider provider, @Param("keyword") String keyword);

    // Find ratings by specific rating value
    List<Rating> findByServiceProviderAndRatingOrderByCreatedAtDesc(ServiceProvider serviceProvider, BigDecimal rating);

    // Count ratings by rating value for a provider
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.serviceProvider = :provider AND r.rating = :ratingValue")
    Long countRatingsByProviderAndValue(@Param("provider") ServiceProvider provider, @Param("ratingValue") BigDecimal ratingValue);

    // Find all ratings with pagination
    Page<Rating> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Get average rating across all providers
    @Query("SELECT AVG(r.rating) FROM Rating r")
    BigDecimal calculateOverallAverageRating();

    // Find ratings for multiple service providers
    @Query("SELECT r FROM Rating r WHERE r.serviceProvider IN :providers ORDER BY r.createdAt DESC")
    List<Rating> findRatingsByProviders(@Param("providers") List<ServiceProvider> providers);
} 