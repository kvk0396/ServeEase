package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Request for creating multiple availability slots in bulk")
public class BulkAvailabilityCreateRequest {

    @NotNull(message = "Start date is required")
    @Schema(description = "Start date for bulk creation", example = "2025-08-10", required = true)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Schema(description = "End date for bulk creation", example = "2025-08-17", required = true)
    private LocalDate endDate;

    @NotEmpty(message = "At least one day must be selected")
    @Schema(description = "Selected days of the week", example = "[\"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\"]", required = true)
    private List<String> selectedDays;

    @NotEmpty(message = "At least one time slot must be provided")
    @Schema(description = "Time slots to create for each selected day", required = true)
    private List<TimeSlot> timeSlots;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    @Schema(description = "Additional notes for all created slots", example = "Available for home visits")
    private String notes;

    // Constructors
    public BulkAvailabilityCreateRequest() {}

    // Getters and Setters
    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<String> getSelectedDays() {
        return selectedDays;
    }

    public void setSelectedDays(List<String> selectedDays) {
        this.selectedDays = selectedDays;
    }

    public List<TimeSlot> getTimeSlots() {
        return timeSlots;
    }

    public void setTimeSlots(List<TimeSlot> timeSlots) {
        this.timeSlots = timeSlots;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Schema(description = "Time slot definition")
    public static class TimeSlot {
        @NotNull(message = "Start time is required")
        @Schema(description = "Start time", example = "09:00", required = true)
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        @Schema(description = "End time", example = "17:00", required = true)
        private LocalTime endTime;

        // Constructors
        public TimeSlot() {}

        public TimeSlot(LocalTime startTime, LocalTime endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }

        // Getters and Setters
        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }
    }
} 