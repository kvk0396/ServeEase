package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Schema(description = "Request for creating a new availability slot")
public class AvailabilityCreateRequest {

    @NotNull(message = "Start date and time is required")
    @Future(message = "Start date and time must be in the future")
    @Schema(description = "Start date and time of availability", example = "2025-08-10T09:00:00", required = true)
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time is required")
    @Future(message = "End date and time must be in the future")
    @Schema(description = "End date and time of availability", example = "2025-08-10T17:00:00", required = true)
    private LocalDateTime endDateTime;

    @Schema(description = "Whether this is a recurring availability", example = "false")
    private Boolean isRecurring = false;

    @Schema(description = "Day of week for recurring availability", example = "MONDAY")
    private DayOfWeek dayOfWeek;

    @Schema(description = "Start time for recurring availability", example = "09:00:00")
    private LocalTime recurringStartTime;

    @Schema(description = "End time for recurring availability", example = "17:00:00")
    private LocalTime recurringEndTime;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    @Schema(description = "Additional notes about this availability", example = "Available for home visits only")
    private String notes;

    // Constructors
    public AvailabilityCreateRequest() {}

    public AvailabilityCreateRequest(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    // Getters and Setters
    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getRecurringStartTime() {
        return recurringStartTime;
    }

    public void setRecurringStartTime(LocalTime recurringStartTime) {
        this.recurringStartTime = recurringStartTime;
    }

    public LocalTime getRecurringEndTime() {
        return recurringEndTime;
    }

    public void setRecurringEndTime(LocalTime recurringEndTime) {
        this.recurringEndTime = recurringEndTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
} 