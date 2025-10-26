package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Rating and review information response")
public class RatingResponse {

    @Schema(description = "Rating ID", example = "1")
    private Long id;

    @Schema(description = "Rating value from 1.0 to 5.0", example = "4.5")
    private BigDecimal rating;

    @Schema(description = "Review text", example = "Excellent service! Very professional and completed the work on time.")
    private String review;

    @Schema(description = "Number of users who found this review helpful", example = "3")
    private Integer helpfulCount;

    @Schema(description = "Customer who gave the rating")
    private CustomerInfo customer;

    @Schema(description = "Service provider who was rated")
    private ServiceProviderInfo serviceProvider;

    @Schema(description = "Booking this rating is associated with")
    private BookingInfo booking;

    @Schema(description = "When the rating was created", example = "2024-01-15T14:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "When the rating was last updated", example = "2024-01-16T10:15:00")
    private LocalDateTime updatedAt;

    // Nested classes for related entities
    @Schema(description = "Customer information")
    public static class CustomerInfo {
        @Schema(description = "Customer ID", example = "2")
        private Long id;
        
        @Schema(description = "Customer full name", example = "John Doe")
        private String fullName;
        
        @Schema(description = "Customer email", example = "john@example.com")
        private String email;

        // Constructors, getters, and setters
        public CustomerInfo() {}

        public CustomerInfo(Long id, String fullName, String email) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    @Schema(description = "Service provider information")
    public static class ServiceProviderInfo {
        @Schema(description = "Provider ID", example = "1")
        private Long id;
        
        @Schema(description = "Business name", example = "Expert Electric Services")
        private String businessName;
        
        @Schema(description = "Provider full name", example = "Jane Smith")
        private String fullName;
        
        @Schema(description = "Average rating", example = "4.8")
        private Double averageRating;

        // Constructors, getters, and setters
        public ServiceProviderInfo() {}

        public ServiceProviderInfo(Long id, String businessName, String fullName, Double averageRating) {
            this.id = id;
            this.businessName = businessName;
            this.fullName = fullName;
            this.averageRating = averageRating;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    }

    @Schema(description = "Booking information")
    public static class BookingInfo {
        @Schema(description = "Booking ID", example = "1")
        private Long id;
        
        @Schema(description = "Service name", example = "Electrical Wiring Installation")
        private String serviceName;
        
        @Schema(description = "When the service was scheduled", example = "2024-01-15T10:30:00")
        private LocalDateTime scheduledDateTime;
        
        @Schema(description = "Booking status", example = "COMPLETED")
        private String status;

        // Constructors, getters, and setters
        public BookingInfo() {}

        public BookingInfo(Long id, String serviceName, LocalDateTime scheduledDateTime, String status) {
            this.id = id;
            this.serviceName = serviceName;
            this.scheduledDateTime = scheduledDateTime;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
        public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // Main class constructors
    public RatingResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public Integer getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(Integer helpfulCount) { this.helpfulCount = helpfulCount; }

    public CustomerInfo getCustomer() { return customer; }
    public void setCustomer(CustomerInfo customer) { this.customer = customer; }

    public ServiceProviderInfo getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(ServiceProviderInfo serviceProvider) { this.serviceProvider = serviceProvider; }

    public BookingInfo getBooking() { return booking; }
    public void setBooking(BookingInfo booking) { this.booking = booking; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 