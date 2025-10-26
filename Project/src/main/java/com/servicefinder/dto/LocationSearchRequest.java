package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "Request for location-based search of service providers")
public class LocationSearchRequest {

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Schema(description = "Customer's latitude", example = "19.0760", required = true)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Schema(description = "Customer's longitude", example = "72.8777", required = true)
    private Double longitude;

    @Positive(message = "Radius must be positive")
    @Schema(description = "Search radius in kilometers", example = "10.0", defaultValue = "10.0")
    private Double radiusKm = 10.0;

    @Schema(description = "Minimum rating filter", example = "3.5")
    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    private Double minRating;

    @Schema(description = "Service category filter", example = "Home Maintenance")
    private String category;

    @Schema(description = "Service subcategory filter", example = "Electrical")
    private String subcategory;

    @Schema(description = "Maximum price filter", example = "100.0")
    @Positive(message = "Maximum price must be positive")
    private Double maxPrice;

    @Schema(description = "Sort by distance (true) or rating (false)", example = "true", defaultValue = "true")
    private Boolean sortByDistance = true;

    @Schema(description = "Maximum number of results", example = "20", defaultValue = "50")
    @Positive(message = "Limit must be positive")
    private Integer limit = 50;

    // Constructors
    public LocationSearchRequest() {}

    public LocationSearchRequest(Double latitude, Double longitude, Double radiusKm) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.radiusKm = radiusKm;
    }

    // Getters and Setters
    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public void setRadiusKm(Double radiusKm) {
        this.radiusKm = radiusKm;
    }

    public Double getMinRating() {
        return minRating;
    }

    public void setMinRating(Double minRating) {
        this.minRating = minRating;
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

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Boolean getSortByDistance() {
        return sortByDistance;
    }

    public void setSortByDistance(Boolean sortByDistance) {
        this.sortByDistance = sortByDistance;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }
} 