package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Response containing availability slot information")
public class AvailabilityResponse {

    @Schema(description = "Availability slot ID", example = "1")
    private Long id;

    @Schema(description = "Service provider information")
    private ProviderInfo provider;

    @Schema(description = "Start date and time", example = "2025-08-10T09:00:00")
    private LocalDateTime startDateTime;

    @Schema(description = "End date and time", example = "2025-08-10T17:00:00")
    private LocalDateTime endDateTime;

    @Schema(description = "Duration in minutes", example = "480")
    private Integer durationMinutes;

    @Schema(description = "Whether this slot is booked", example = "false")
    private Boolean isBooked;

    @Schema(description = "Whether this is recurring availability", example = "false")
    private Boolean isRecurring;

    @Schema(description = "Day of week for recurring slots", example = "MONDAY")
    private DayOfWeek dayOfWeek;

    @Schema(description = "Recurring start time", example = "09:00:00")
    private LocalTime recurringStartTime;

    @Schema(description = "Recurring end time", example = "17:00:00")
    private LocalTime recurringEndTime;

    @Schema(description = "Additional notes", example = "Available for home visits")
    private String notes;

    @Schema(description = "Distance from search location in km", example = "5.2")
    private Double distance;

    @Schema(description = "Available services during this slot")
    private List<ServiceInfo> availableServices;

    @Schema(description = "Created date", example = "2025-08-01T10:00:00")
    private LocalDateTime createdAt;

    // Nested DTOs
    @Schema(description = "Service provider information")
    public static class ProviderInfo {
        @Schema(description = "Provider ID", example = "1")
        private Long id;

        @Schema(description = "Business name", example = "Smith's Professional Services")
        private String businessName;

        @Schema(description = "Provider full name", example = "Jane Smith")
        private String fullName;

        @Schema(description = "Phone number", example = "+919876543211")
        private String phoneNumber;

        @Schema(description = "Average rating", example = "4.5")
        private Double averageRating;

        @Schema(description = "Years of experience", example = "5")
        private Integer yearsOfExperience;

        @Schema(description = "Verification status", example = "VERIFIED")
        private String verificationStatus;

        public ProviderInfo() {}

        public ProviderInfo(Long id, String businessName, String fullName, String phoneNumber, 
                           Double averageRating, Integer yearsOfExperience, String verificationStatus) {
            this.id = id;
            this.businessName = businessName;
            this.fullName = fullName;
            this.phoneNumber = phoneNumber;
            this.averageRating = averageRating;
            this.yearsOfExperience = yearsOfExperience;
            this.verificationStatus = verificationStatus;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    }

    @Schema(description = "Service information")
    public static class ServiceInfo {
        @Schema(description = "Service ID", example = "1")
        private Long id;

        @Schema(description = "Service name", example = "Home Electrical Repair")
        private String name;

        @Schema(description = "Category", example = "Home Maintenance")
        private String category;

        @Schema(description = "Price", example = "75.00")
        private String price;

        @Schema(description = "Duration in minutes", example = "120")
        private Integer durationMinutes;

        public ServiceInfo() {}

        public ServiceInfo(Long id, String name, String category, String price, Integer durationMinutes) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.price = price;
            this.durationMinutes = durationMinutes;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }

    // Constructors
    public AvailabilityResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProviderInfo getProvider() { return provider; }
    public void setProvider(ProviderInfo provider) { this.provider = provider; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Boolean getIsBooked() { return isBooked; }
    public void setIsBooked(Boolean isBooked) { this.isBooked = isBooked; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getRecurringStartTime() { return recurringStartTime; }
    public void setRecurringStartTime(LocalTime recurringStartTime) { this.recurringStartTime = recurringStartTime; }

    public LocalTime getRecurringEndTime() { return recurringEndTime; }
    public void setRecurringEndTime(LocalTime recurringEndTime) { this.recurringEndTime = recurringEndTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public List<ServiceInfo> getAvailableServices() { return availableServices; }
    public void setAvailableServices(List<ServiceInfo> availableServices) { this.availableServices = availableServices; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 