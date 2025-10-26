package com.servicefinder.model;

import com.servicefinder.model.enums.VerificationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "service_providers")
public class ServiceProvider extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Business name is required")
    @Size(max = 100, message = "Business name must not exceed 100 characters")
    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @DecimalMin(value = "0.0", message = "Rating must be at least 0")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5")
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_ratings")
    private Integer totalRatings = 0;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "available", nullable = false)
    private Boolean available = true;

    @Column(name = "profile_verified", nullable = false)
    private Boolean profileVerified = false;

    @Column(name = "background_checked", nullable = false)
    private Boolean backgroundChecked = false;

    @Column(name = "insurance_verified", nullable = false)
    private Boolean insuranceVerified = false;

    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm = 50; // Default 50km radius

    @Size(max = 500, message = "Working hours must not exceed 500 characters")
    @Column(name = "working_hours", length = 500)
    private String workingHours;

    // Relationships
    @OneToMany(mappedBy = "serviceProvider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Service> services = new HashSet<>();

    @OneToMany(mappedBy = "serviceProvider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();

    @OneToMany(mappedBy = "serviceProvider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Rating> receivedRatings = new HashSet<>();

    @OneToMany(mappedBy = "serviceProvider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Availability> availabilities = new HashSet<>();

    // Constructors
    public ServiceProvider() {}

    public ServiceProvider(User user, String businessName) {
        this.user = user;
        this.businessName = businessName;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(Integer totalRatings) {
        this.totalRatings = totalRatings;
    }

    public Integer getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Integer totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Boolean getProfileVerified() {
        return profileVerified;
    }

    public void setProfileVerified(Boolean profileVerified) {
        this.profileVerified = profileVerified;
    }

    public Boolean getBackgroundChecked() {
        return backgroundChecked;
    }

    public void setBackgroundChecked(Boolean backgroundChecked) {
        this.backgroundChecked = backgroundChecked;
    }

    public Boolean getInsuranceVerified() {
        return insuranceVerified;
    }

    public void setInsuranceVerified(Boolean insuranceVerified) {
        this.insuranceVerified = insuranceVerified;
    }

    public Integer getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(Integer serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }

    public String getWorkingHours() {
        return workingHours;
    }

    public void setWorkingHours(String workingHours) {
        this.workingHours = workingHours;
    }

    public Set<Service> getServices() {
        return services;
    }

    public void setServices(Set<Service> services) {
        this.services = services;
    }

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }

    public Set<Rating> getReceivedRatings() {
        return receivedRatings;
    }

    public void setReceivedRatings(Set<Rating> receivedRatings) {
        this.receivedRatings = receivedRatings;
    }

    public Set<Availability> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(Set<Availability> availabilities) {
        this.availabilities = availabilities;
    }

    // Utility methods
    public boolean isVerified() {
        return verificationStatus == VerificationStatus.VERIFIED;
    }

    public boolean hasTrustBadges() {
        return profileVerified || backgroundChecked || insuranceVerified;
    }

    public int getTrustScore() {
        int score = 0;
        if (profileVerified) score += 25;
        if (backgroundChecked) score += 35;
        if (insuranceVerified) score += 40;
        return score;
    }
} 