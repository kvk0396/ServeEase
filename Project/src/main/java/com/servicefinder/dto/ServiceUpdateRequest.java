package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Schema(description = "Request to update an existing service")
public class ServiceUpdateRequest {

    @Schema(description = "Service name", example = "Updated Home Electrical Repair")
    @Size(max = 100, message = "Service name must not exceed 100 characters")
    private String name;

    @Schema(description = "Service description", example = "Updated professional electrical repair services")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Schema(description = "Service category", example = "Home Maintenance")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Schema(description = "Service subcategory", example = "Electrical")
    @Size(max = 50, message = "Subcategory must not exceed 50 characters")
    private String subcategory;

    @Schema(description = "Service price", example = "85.00")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999.99", message = "Price must not exceed 99999.99")
    private BigDecimal price;

    @Schema(description = "Service duration in minutes", example = "150")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 1440, message = "Duration must not exceed 1440 minutes (24 hours)")
    private Integer durationMinutes;

    @Schema(description = "Whether the service is active", example = "true")
    private Boolean active;

    @Schema(description = "Service area in format 'City, District'", example = "Chennai, Chennai District")
    @Size(max = 150, message = "Service area must not exceed 150 characters")
    private String serviceArea;

    @Schema(description = "City", example = "Chennai")
    @Size(max = 100)
    private String city;

    @Schema(description = "District", example = "Chennai District")
    @Size(max = 100)
    private String district;

    @Schema(description = "State", example = "Tamil Nadu")
    @Size(max = 100)
    private String state;

    @Schema(description = "Country", example = "India")
    @Size(max = 100)
    private String country;

    @Schema(description = "Postal code", example = "600001")
    @Size(max = 20)
    private String postalCode;

    @Schema(description = "Latitude", example = "13.0827")
    private Double latitude;

    @Schema(description = "Longitude", example = "80.2707")
    private Double longitude;

    @Schema(description = "Service radius in km", example = "25")
    private Integer serviceRadiusKm;

    // Constructors
    public ServiceUpdateRequest() {}

    // Getters and Setters
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
} 