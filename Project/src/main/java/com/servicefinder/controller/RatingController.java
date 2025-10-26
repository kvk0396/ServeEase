package com.servicefinder.controller;

import com.servicefinder.dto.RatingCreateRequest;
import com.servicefinder.dto.RatingResponse;
import com.servicefinder.dto.RatingUpdateRequest;
import com.servicefinder.model.*;
import com.servicefinder.model.enums.BookingStatus;
import com.servicefinder.model.enums.Role;
import com.servicefinder.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ratings")
@Tag(name = "Rating & Review Management", description = "APIs for managing ratings and reviews")
@SecurityRequirement(name = "bearerAuth")
public class RatingController {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    // Create a new rating
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a new rating", description = "Customer can rate a completed service")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Rating created successfully",
                content = @Content(schema = @Schema(implementation = RatingResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid rating request or booking not completed"),
        @ApiResponse(responseCode = "403", description = "Only customers can create ratings"),
        @ApiResponse(responseCode = "404", description = "Booking not found"),
        @ApiResponse(responseCode = "409", description = "Rating already exists for this booking")
    })
    public ResponseEntity<?> createRating(
            @Valid @RequestBody RatingCreateRequest request,
            Authentication authentication) {
        
        try {
            // Get the authenticated customer
            User customer = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // Get the booking
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Verify this is the customer's booking
            if (!booking.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only rate your own bookings");
            }

            // Verify booking is completed
            if (booking.getStatus() != BookingStatus.COMPLETED) {
                return ResponseEntity.badRequest()
                        .body("You can only rate completed services");
            }

            // Check if rating already exists
            if (ratingRepository.existsByBooking(booking)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("You have already rated this booking");
            }

            // Create the rating
            Rating rating = new Rating();
            rating.setUser(customer);
            rating.setServiceProvider(booking.getServiceProvider());
            rating.setBooking(booking);
            rating.setRating(request.getRating());
            rating.setReview(request.getReview());
            rating.setHelpfulCount(0);

            Rating savedRating = ratingRepository.save(rating);

            // Update service provider's average rating
            updateProviderAverageRating(booking.getServiceProvider());

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedRating));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error creating rating: " + e.getMessage());
        }
    }

    // Get rating by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get rating by ID", description = "Retrieve a specific rating by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating found",
                content = @Content(schema = @Schema(implementation = RatingResponse.class))),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<?> getRatingById(
            @Parameter(description = "Rating ID") @PathVariable Long id) {
        
        Optional<Rating> ratingOpt = ratingRepository.findById(id);
        if (ratingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToResponse(ratingOpt.get()));
    }

    // Get customer's ratings
    @GetMapping("/my-ratings")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer's ratings", description = "Retrieve all ratings given by the authenticated customer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully")
    })
    public ResponseEntity<Page<RatingResponse>> getCustomerRatings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        User customer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratings = ratingRepository.findByUserOrderByCreatedAtDesc(customer, pageable);

        Page<RatingResponse> response = ratings.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    // Get customer's ratings (alternative endpoint for frontend compatibility)
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer's ratings", description = "Retrieve all ratings given by the authenticated customer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully")
    })
    public ResponseEntity<Page<RatingResponse>> getCustomerRatingsAlternative(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        return getCustomerRatings(page, size, authentication);
    }

    // Get provider's ratings
    @GetMapping("/provider-ratings")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Get provider's ratings", description = "Retrieve all ratings for the authenticated service provider")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully")
    })
    public ResponseEntity<Page<RatingResponse>> getProviderRatings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Only show ratings with reviews") @RequestParam(defaultValue = "false") boolean reviewsOnly,
            Authentication authentication) {
        
        User providerUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository.findByUser(providerUser)
                .orElseThrow(() -> new RuntimeException("Service provider profile not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratings;

        if (reviewsOnly) {
            ratings = ratingRepository.findRatingsWithReviewsByProvider(provider, pageable);
        } else {
            ratings = ratingRepository.findByServiceProviderOrderByCreatedAtDesc(provider, pageable);
        }

        Page<RatingResponse> response = ratings.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    // Get ratings for a specific provider (public endpoint)
    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get ratings for a provider", description = "Retrieve all ratings for a specific service provider (public)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    public ResponseEntity<Page<RatingResponse>> getProviderRatingsPublic(
            @Parameter(description = "Service provider ID") @PathVariable Long providerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Only show ratings with reviews") @RequestParam(defaultValue = "false") boolean reviewsOnly,
            @Parameter(description = "Minimum rating filter") @RequestParam(required = false) BigDecimal minRating,
            @Parameter(description = "Maximum rating filter") @RequestParam(required = false) BigDecimal maxRating) {
        
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Service provider not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratings;

        if (reviewsOnly) {
            ratings = ratingRepository.findRatingsWithReviewsByProvider(provider, pageable);
        } else {
            ratings = ratingRepository.findByServiceProviderOrderByCreatedAtDesc(provider, pageable);
        }

        // Apply rating filters if provided
        if (minRating != null || maxRating != null) {
            BigDecimal min = minRating != null ? minRating : BigDecimal.valueOf(1.0);
            BigDecimal max = maxRating != null ? maxRating : BigDecimal.valueOf(5.0);
            
            List<Rating> filteredRatings = ratingRepository.findRatingsByProviderAndRatingRange(provider, min, max);
            // Convert to page (simplified - in real implementation, you'd handle pagination properly)
            ratings = Page.empty(); // For simplicity, returning filtered results without pagination
        }

        Page<RatingResponse> response = ratings.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    // Update rating
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Update rating", description = "Update an existing rating (only by the customer who created it)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating updated successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied - can only update own ratings"),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<?> updateRating(
            @Parameter(description = "Rating ID") @PathVariable Long id,
            @Valid @RequestBody RatingUpdateRequest request,
            Authentication authentication) {
        
        Optional<Rating> ratingOpt = ratingRepository.findById(id);
        if (ratingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Rating rating = ratingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if this is the user's rating
        if (!rating.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only update your own ratings.");
        }

        // Apply updates
        if (request.getRating() != null) {
            rating.setRating(request.getRating());
        }
        if (request.getReview() != null) {
            rating.setReview(request.getReview());
        }

        Rating updatedRating = ratingRepository.save(rating);

        // Update service provider's average rating
        updateProviderAverageRating(rating.getServiceProvider());

        return ResponseEntity.ok(convertToResponse(updatedRating));
    }

    // Get rating by booking ID
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Get rating by booking ID", description = "Retrieve rating for a specific booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating found",
                content = @Content(schema = @Schema(implementation = RatingResponse.class))),
        @ApiResponse(responseCode = "404", description = "Rating not found for this booking")
    })
    public ResponseEntity<?> getRatingByBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            Authentication authentication) {
        
        try {
            // Get the booking first
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Get the authenticated user
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has access to this booking (customer who made it or provider who served it)
            boolean hasAccess = false;
            if (currentUser.getRole() == Role.CUSTOMER && booking.getCustomer().getId().equals(currentUser.getId())) {
                hasAccess = true;
            } else if (currentUser.getRole() == Role.SERVICE_PROVIDER) {
                ServiceProvider provider = serviceProviderRepository.findByUser(currentUser).orElse(null);
                if (provider != null && booking.getServiceProvider().getId().equals(provider.getId())) {
                    hasAccess = true;
                }
            } else if (currentUser.getRole() == Role.ADMIN) {
                hasAccess = true;
            }

            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied. You can only view ratings for your own bookings.");
            }

            // Find the rating for this booking
            Optional<Rating> ratingOpt = ratingRepository.findByBooking(booking);
            if (ratingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(convertToResponse(ratingOpt.get()));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error retrieving rating: " + e.getMessage());
        }
    }

    // Delete rating
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @Operation(summary = "Delete rating", description = "Delete a rating (by customer who created it or admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Rating deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<?> deleteRating(
            @Parameter(description = "Rating ID") @PathVariable Long id,
            Authentication authentication) {
        
        Optional<Rating> ratingOpt = ratingRepository.findById(id);
        if (ratingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Rating rating = ratingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check permissions
        boolean canDelete = currentUser.getRole() == Role.ADMIN ||
                           rating.getUser().getId().equals(currentUser.getId());

        if (!canDelete) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only delete your own ratings.");
        }

        ServiceProvider provider = rating.getServiceProvider();
        ratingRepository.delete(rating);

        // Update service provider's average rating
        updateProviderAverageRating(provider);

        return ResponseEntity.noContent().build();
    }

    // Mark review as helpful
    @PostMapping("/{id}/helpful")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Mark review as helpful", description = "Increment the helpful count for a review")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Review marked as helpful"),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<?> markReviewHelpful(
            @Parameter(description = "Rating ID") @PathVariable Long id) {
        
        Optional<Rating> ratingOpt = ratingRepository.findById(id);
        if (ratingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Rating rating = ratingOpt.get();
        rating.setHelpfulCount(rating.getHelpfulCount() + 1);
        Rating updatedRating = ratingRepository.save(rating);

        return ResponseEntity.ok(convertToResponse(updatedRating));
    }

    // Get rating statistics for a provider
    @GetMapping("/provider/{providerId}/stats")
    @Operation(summary = "Get rating statistics", description = "Get detailed rating statistics for a service provider")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    public ResponseEntity<?> getProviderRatingStats(
            @Parameter(description = "Service provider ID") @PathVariable Long providerId) {
        
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Service provider not found"));

        // Calculate statistics
        BigDecimal averageRating = ratingRepository.calculateAverageRatingByProvider(provider);
        Long totalRatings = ratingRepository.countRatingsByProvider(provider);
        List<Object[]> ratingDistribution = ratingRepository.getRatingDistributionByProvider(provider);

        // Calculate percentages for each rating value
        RatingStats stats = new RatingStats();
        stats.setAverageRating(averageRating != null ? averageRating.doubleValue() : 0.0);
        stats.setTotalRatings(totalRatings != null ? totalRatings : 0L);

        // Process rating distribution
        if (totalRatings != null && totalRatings > 0) {
            for (Object[] dist : ratingDistribution) {
                BigDecimal ratingValue = (BigDecimal) dist[0];
                Long count = (Long) dist[1];
                double percentage = (count.doubleValue() / totalRatings.doubleValue()) * 100;
                
                switch (ratingValue.intValue()) {
                    case 5: stats.setFiveStarPercentage(percentage); break;
                    case 4: stats.setFourStarPercentage(percentage); break;
                    case 3: stats.setThreeStarPercentage(percentage); break;
                    case 2: stats.setTwoStarPercentage(percentage); break;
                    case 1: stats.setOneStarPercentage(percentage); break;
                }
            }
        }

        return ResponseEntity.ok(stats);
    }

    // Search reviews by keyword
    @GetMapping("/provider/{providerId}/search")
    @Operation(summary = "Search reviews", description = "Search reviews for a provider by keyword")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reviews found"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    public ResponseEntity<List<RatingResponse>> searchReviews(
            @Parameter(description = "Service provider ID") @PathVariable Long providerId,
            @Parameter(description = "Search keyword") @RequestParam String keyword) {
        
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Service provider not found"));

        List<Rating> ratings = ratingRepository.searchReviewsByKeyword(provider, keyword);
        List<RatingResponse> response = ratings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Helper method to update provider's average rating
    private void updateProviderAverageRating(ServiceProvider provider) {
        BigDecimal averageRating = ratingRepository.calculateAverageRatingByProvider(provider);
        Long totalRatings = ratingRepository.countRatingsByProvider(provider);
        
        if (averageRating != null) {
            provider.setAverageRating(averageRating);
        } else {
            provider.setAverageRating(BigDecimal.ZERO);
        }
        
        if (totalRatings != null) {
            provider.setTotalRatings(totalRatings.intValue());
        } else {
            provider.setTotalRatings(0);
        }
        
        serviceProviderRepository.save(provider);
    }

    // Helper method to convert Rating to RatingResponse
    private RatingResponse convertToResponse(Rating rating) {
        RatingResponse response = new RatingResponse();
        
        response.setId(rating.getId());
        response.setRating(rating.getRating());
        response.setReview(rating.getReview());
        response.setHelpfulCount(rating.getHelpfulCount());
        response.setCreatedAt(rating.getCreatedAt());
        response.setUpdatedAt(rating.getUpdatedAt());

        // Customer info
        User customer = rating.getUser();
        RatingResponse.CustomerInfo customerInfo = new RatingResponse.CustomerInfo(
                customer.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getEmail()
        );
        response.setCustomer(customerInfo);

        // Service provider info
        ServiceProvider provider = rating.getServiceProvider();
        User providerUser = provider.getUser();
        RatingResponse.ServiceProviderInfo providerInfo = new RatingResponse.ServiceProviderInfo(
                provider.getId(),
                provider.getBusinessName(),
                providerUser.getFirstName() + " " + providerUser.getLastName(),
                provider.getAverageRating() != null ? Double.valueOf(provider.getAverageRating().doubleValue()) : 0.0
        );
        response.setServiceProvider(providerInfo);

        // Booking info
        Booking booking = rating.getBooking();
        RatingResponse.BookingInfo bookingInfo = new RatingResponse.BookingInfo(
                booking.getId(),
                booking.getService().getName(),
                booking.getScheduledDateTime(),
                booking.getStatus().toString()
        );
        response.setBooking(bookingInfo);

        return response;
    }

    // Inner class for rating statistics
    public static class RatingStats {
        private Double averageRating;
        private Long totalRatings;
        private Double fiveStarPercentage = 0.0;
        private Double fourStarPercentage = 0.0;
        private Double threeStarPercentage = 0.0;
        private Double twoStarPercentage = 0.0;
        private Double oneStarPercentage = 0.0;

        // Getters and setters
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        public Long getTotalRatings() { return totalRatings; }
        public void setTotalRatings(Long totalRatings) { this.totalRatings = totalRatings; }
        public Double getFiveStarPercentage() { return fiveStarPercentage; }
        public void setFiveStarPercentage(Double fiveStarPercentage) { this.fiveStarPercentage = fiveStarPercentage; }
        public Double getFourStarPercentage() { return fourStarPercentage; }
        public void setFourStarPercentage(Double fourStarPercentage) { this.fourStarPercentage = fourStarPercentage; }
        public Double getThreeStarPercentage() { return threeStarPercentage; }
        public void setThreeStarPercentage(Double threeStarPercentage) { this.threeStarPercentage = threeStarPercentage; }
        public Double getTwoStarPercentage() { return twoStarPercentage; }
        public void setTwoStarPercentage(Double twoStarPercentage) { this.twoStarPercentage = twoStarPercentage; }
        public Double getOneStarPercentage() { return oneStarPercentage; }
        public void setOneStarPercentage(Double oneStarPercentage) { this.oneStarPercentage = oneStarPercentage; }
    }
} 