package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Request for searching available time slots")
public class AvailabilitySearchRequest {

    @Schema(description = "Service type/category to search for", example = "plumbing")
    private String serviceType;

    @NotNull(message = "Start date is required")
    @Schema(description = "Start date for availability search", example = "2025-08-10T00:00:00", required = true)
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Schema(description = "End date for availability search", example = "2025-08-17T23:59:59", required = true)
    private LocalDateTime endDate;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Schema(description = "Required duration in minutes", example = "120")
    private Integer durationMinutes;

    @Schema(description = "Preferred start time", example = "2025-08-10T14:00:00")
    private LocalDateTime preferredStartTime;

    @Schema(description = "Customer's latitude for distance filtering", example = "19.0760")
    private Double latitude;

    @Schema(description = "Customer's longitude for distance filtering", example = "72.8777")
    private Double longitude;

    @Schema(description = "Search radius in kilometers", example = "15.0")
    private Double radiusKm;

    @Schema(description = "Specific provider ID to search", example = "1")
    private Long providerId;

    @Schema(description = "Maximum number of results to return", example = "20")
    private Integer limit = 50;

    @Schema(description = "Sort results by start time", example = "true")
    private Boolean sortByTime = true;

    // Constructors
    public AvailabilitySearchRequest() {}

    public AvailabilitySearchRequest(LocalDateTime startDate, LocalDateTime endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public LocalDateTime getPreferredStartTime() {
        return preferredStartTime;
    }

    public void setPreferredStartTime(LocalDateTime preferredStartTime) {
        this.preferredStartTime = preferredStartTime;
    }

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

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Boolean getSortByTime() {
        return sortByTime;
    }

    public void setSortByTime(Boolean sortByTime) {
        this.sortByTime = sortByTime;
    }
} 