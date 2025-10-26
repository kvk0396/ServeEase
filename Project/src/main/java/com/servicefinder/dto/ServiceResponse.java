package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.servicefinder.model.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Service response with provider information")
public class ServiceResponse {

    @Schema(description = "Service ID", example = "1")
    private Long id;

    @Schema(description = "Service name", example = "Home Electrical Repair")
    private String name;

    @Schema(description = "Service description", example = "Professional electrical repair services")
    private String description;

    @Schema(description = "Service category", example = "Home Maintenance")
    private String category;

    @Schema(description = "Service subcategory", example = "Electrical")
    private String subcategory;

    @Schema(description = "Service price", example = "75.00")
    private BigDecimal price;

    @Schema(description = "Service duration in minutes", example = "120")
    private Integer durationMinutes;

    @Schema(description = "Whether the service is active", example = "true")
    private Boolean active;

    @Schema(description = "Service creation date", example = "2025-01-01T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Service last update date", example = "2025-01-02T14:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Service area (City, District)", example = "Chennai, Chennai District")
    private String serviceArea;

    @Schema(description = "City", example = "Chennai")
    private String city;

    @Schema(description = "District", example = "Chennai District")
    private String district;

    @Schema(description = "State", example = "Tamil Nadu")
    private String state;

    @Schema(description = "Country", example = "India")
    private String country;

    @Schema(description = "Postal code", example = "600001")
    private String postalCode;

    @Schema(description = "Latitude", example = "13.0827")
    private Double latitude;

    @Schema(description = "Longitude", example = "80.2707")
    private Double longitude;

    @Schema(description = "Service radius in km", example = "25")
    private Integer serviceRadiusKm;

    // Service Provider Information
    @Schema(description = "Service provider ID", example = "1")
    private Long serviceProviderId;

    @Schema(description = "Service provider business name", example = "John's Electrical Services")
    private String providerBusinessName;

    @Schema(description = "Service provider full name", example = "John Smith")
    private String providerName;

    @Schema(description = "Service provider email", example = "john@electricalservices.com")
    private String providerEmail;

    @Schema(description = "Service provider phone", example = "+1234567890")
    private String providerPhone;

    @Schema(description = "Service provider average rating", example = "4.5")
    private BigDecimal providerAverageRating;

    @Schema(description = "Service provider total ratings", example = "25")
    private Integer providerTotalRatings;

    @Schema(description = "Service provider verification status", example = "VERIFIED")
    private String providerVerificationStatus;

    @Schema(description = "Service provider availability", example = "true")
    private Boolean providerAvailable;

    // Constructors
    public ServiceResponse() {}

    public ServiceResponse(Service service) {
        this.id = service.getId();
        this.name = service.getName();
        this.description = service.getDescription();
        this.category = service.getCategory();
        this.subcategory = service.getSubcategory();
        this.price = service.getPrice();
        this.durationMinutes = service.getDurationMinutes();
        this.active = service.getActive();
        this.createdAt = service.getCreatedAt();
        this.updatedAt = service.getUpdatedAt();
        this.serviceArea = service.getServiceArea();
        this.city = service.getLocationCity();
        this.district = service.getLocationDistrict();
        this.state = service.getLocationState();
        this.country = service.getLocationCountry();
        this.postalCode = service.getLocationPostalCode();
        this.latitude = service.getLocationLatitude();
        this.longitude = service.getLocationLongitude();
        this.serviceRadiusKm = service.getServiceRadiusKm();

        // Service Provider Information
        if (service.getServiceProvider() != null) {
            this.serviceProviderId = service.getServiceProvider().getId();
            this.providerBusinessName = service.getServiceProvider().getBusinessName();
            this.providerAverageRating = service.getServiceProvider().getAverageRating();
            this.providerTotalRatings = service.getServiceProvider().getTotalRatings();
            this.providerVerificationStatus = service.getServiceProvider().getVerificationStatus().name();
            this.providerAvailable = service.getServiceProvider().getAvailable();

            if (service.getServiceProvider().getUser() != null) {
                this.providerName = service.getServiceProvider().getUser().getFullName();
                this.providerEmail = service.getServiceProvider().getUser().getEmail();
                this.providerPhone = service.getServiceProvider().getUser().getPhoneNumber();
            }
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getServiceRadiusKm() { return serviceRadiusKm; }
    public void setServiceRadiusKm(Integer serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }

    public Long getServiceProviderId() {
        return serviceProviderId;
    }

    public void setServiceProviderId(Long serviceProviderId) {
        this.serviceProviderId = serviceProviderId;
    }

    public String getProviderBusinessName() {
        return providerBusinessName;
    }

    public void setProviderBusinessName(String providerBusinessName) {
        this.providerBusinessName = providerBusinessName;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getProviderEmail() {
        return providerEmail;
    }

    public void setProviderEmail(String providerEmail) {
        this.providerEmail = providerEmail;
    }

    public String getProviderPhone() {
        return providerPhone;
    }

    public void setProviderPhone(String providerPhone) {
        this.providerPhone = providerPhone;
    }

    public BigDecimal getProviderAverageRating() {
        return providerAverageRating;
    }

    public void setProviderAverageRating(BigDecimal providerAverageRating) {
        this.providerAverageRating = providerAverageRating;
    }

    public Integer getProviderTotalRatings() {
        return providerTotalRatings;
    }

    public void setProviderTotalRatings(Integer providerTotalRatings) {
        this.providerTotalRatings = providerTotalRatings;
    }

    public String getProviderVerificationStatus() {
        return providerVerificationStatus;
    }

    public void setProviderVerificationStatus(String providerVerificationStatus) {
        this.providerVerificationStatus = providerVerificationStatus;
    }

    public Boolean getProviderAvailable() {
        return providerAvailable;
    }

    public void setProviderAvailable(Boolean providerAvailable) {
        this.providerAvailable = providerAvailable;
    }
} 