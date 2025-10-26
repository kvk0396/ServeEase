package com.servicefinder.dto;

import com.servicefinder.model.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Booking information response")
public class BookingResponse {

    @Schema(description = "Booking ID", example = "1")
    private Long id;

    @Schema(description = "Customer information")
    private CustomerInfo customer;

    @Schema(description = "Service provider information") 
    private ServiceProviderInfo serviceProvider;

    @Schema(description = "Service information")
    private ServiceInfo service;

    @Schema(description = "Scheduled date and time", example = "2024-01-15T10:30:00")
    private LocalDateTime scheduledDateTime;

    @Schema(description = "Estimated end date and time", example = "2024-01-15T12:30:00")
    private LocalDateTime estimatedEndDateTime;

    @Schema(description = "Actual start date and time", example = "2024-01-15T10:35:00")
    private LocalDateTime actualStartDateTime;

    @Schema(description = "Actual end date and time", example = "2024-01-15T12:15:00")
    private LocalDateTime actualEndDateTime;

    @Schema(description = "Booking status", example = "CONFIRMED")
    private BookingStatus status;

    @Schema(description = "Total price for the service", example = "150.00")
    private BigDecimal totalPrice;

    @Schema(description = "Additional notes", example = "Please call 15 minutes before arrival")
    private String notes;

    @Schema(description = "Service location address", example = "123 Main St, City, State")
    private String customerAddress;

    @Schema(description = "Latitude of service location", example = "40.7128")
    private Double customerLatitude;

    @Schema(description = "Longitude of service location", example = "-74.0060")
    private Double customerLongitude;

    @Schema(description = "Cancellation reason", example = "Customer emergency")
    private String cancellationReason;

    @Schema(description = "Who cancelled the booking", example = "customer")
    private String cancelledBy;

    @Schema(description = "When the booking was cancelled", example = "2024-01-14T15:30:00")
    private LocalDateTime cancellationDateTime;

    @Schema(description = "When the booking was created", example = "2024-01-10T14:20:00")
    private LocalDateTime createdAt;

    @Schema(description = "When the booking was last updated", example = "2024-01-12T16:45:00")
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
        
        @Schema(description = "Customer phone", example = "+1234567890")
        private String phoneNumber;

        // Constructors, getters, and setters
        public CustomerInfo() {}

        public CustomerInfo(Long id, String fullName, String email, String phoneNumber) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    @Schema(description = "Service provider information")
    public static class ServiceProviderInfo {
        @Schema(description = "Provider ID", example = "1")
        private Long id;
        
        @Schema(description = "Business name", example = "Expert Electric Services")
        private String businessName;
        
        @Schema(description = "Provider full name", example = "Jane Smith")
        private String fullName;
        
        @Schema(description = "Provider email", example = "jane@example.com")
        private String email;
        
        @Schema(description = "Provider phone", example = "+1234567890")
        private String phoneNumber;
        
        @Schema(description = "Average rating", example = "4.8")
        private Double averageRating;

        // Constructors, getters, and setters
        public ServiceProviderInfo() {}

        public ServiceProviderInfo(Long id, String businessName, String fullName, String email, String phoneNumber, Double averageRating) {
            this.id = id;
            this.businessName = businessName;
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.averageRating = averageRating;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    }

    @Schema(description = "Service information")
    public static class ServiceInfo {
        @Schema(description = "Service ID", example = "1")
        private Long id;
        
        @Schema(description = "Service name", example = "Electrical Wiring Installation")
        private String name;
        
        @Schema(description = "Service category", example = "Home Services")
        private String category;
        
        @Schema(description = "Service subcategory", example = "Electrical")
        private String subcategory;
        
        @Schema(description = "Service price", example = "75.00")
        private BigDecimal price;
        
        @Schema(description = "Duration in minutes", example = "120")
        private Integer durationMinutes;

        // Constructors, getters, and setters
        public ServiceInfo() {}

        public ServiceInfo(Long id, String name, String category, String subcategory, BigDecimal price, Integer durationMinutes) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.subcategory = subcategory;
            this.price = price;
            this.durationMinutes = durationMinutes;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSubcategory() { return subcategory; }
        public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }

    // Main class constructors
    public BookingResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CustomerInfo getCustomer() { return customer; }
    public void setCustomer(CustomerInfo customer) { this.customer = customer; }

    public ServiceProviderInfo getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(ServiceProviderInfo serviceProvider) { this.serviceProvider = serviceProvider; }

    public ServiceInfo getService() { return service; }
    public void setService(ServiceInfo service) { this.service = service; }

    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }

    public LocalDateTime getEstimatedEndDateTime() { return estimatedEndDateTime; }
    public void setEstimatedEndDateTime(LocalDateTime estimatedEndDateTime) { this.estimatedEndDateTime = estimatedEndDateTime; }

    public LocalDateTime getActualStartDateTime() { return actualStartDateTime; }
    public void setActualStartDateTime(LocalDateTime actualStartDateTime) { this.actualStartDateTime = actualStartDateTime; }

    public LocalDateTime getActualEndDateTime() { return actualEndDateTime; }
    public void setActualEndDateTime(LocalDateTime actualEndDateTime) { this.actualEndDateTime = actualEndDateTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public Double getCustomerLatitude() { return customerLatitude; }
    public void setCustomerLatitude(Double customerLatitude) { this.customerLatitude = customerLatitude; }

    public Double getCustomerLongitude() { return customerLongitude; }
    public void setCustomerLongitude(Double customerLongitude) { this.customerLongitude = customerLongitude; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public LocalDateTime getCancellationDateTime() { return cancellationDateTime; }
    public void setCancellationDateTime(LocalDateTime cancellationDateTime) { this.cancellationDateTime = cancellationDateTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 