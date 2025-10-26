package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Request to create a new booking")
public class BookingCreateRequest {

    @NotNull(message = "Service ID is required")
    @Schema(description = "ID of the service to book", example = "1")
    private Long serviceId;

    @NotNull(message = "Scheduled date and time is required")
    @Future(message = "Scheduled date and time must be in the future")
    @Schema(description = "When the service should be performed", example = "2024-01-15T10:30:00")
    private LocalDateTime scheduledDateTime;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Schema(description = "Additional notes or requirements for the service", example = "Please call 15 minutes before arrival")
    private String notes;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    @Schema(description = "Address where the service should be performed", example = "123 Main St, Apartment 4B, City, State 12345")
    private String customerAddress;

    @Schema(description = "Latitude of the service location", example = "40.7128")
    private Double customerLatitude;

    @Schema(description = "Longitude of the service location", example = "-74.0060")
    private Double customerLongitude;

    // Constructors
    public BookingCreateRequest() {}

    public BookingCreateRequest(Long serviceId, LocalDateTime scheduledDateTime) {
        this.serviceId = serviceId;
        this.scheduledDateTime = scheduledDateTime;
    }

    // Getters and Setters
    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public LocalDateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(LocalDateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public Double getCustomerLatitude() {
        return customerLatitude;
    }

    public void setCustomerLatitude(Double customerLatitude) {
        this.customerLatitude = customerLatitude;
    }

    public Double getCustomerLongitude() {
        return customerLongitude;
    }

    public void setCustomerLongitude(Double customerLongitude) {
        this.customerLongitude = customerLongitude;
    }
} 