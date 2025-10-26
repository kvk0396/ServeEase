package com.servicefinder.dto;

import com.servicefinder.model.enums.BookingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Request to update a booking")
public class BookingUpdateRequest {

    @Schema(description = "New status for the booking", example = "CONFIRMED")
    private BookingStatus status;

    @Schema(description = "New scheduled date and time (if rescheduling)", example = "2024-01-15T14:30:00")
    private LocalDateTime scheduledDateTime;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Schema(description = "Updated notes for the booking", example = "Changed to afternoon appointment")
    private String notes;

    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    @Schema(description = "Reason for cancellation (required if status is CANCELLED)", example = "Customer emergency")
    private String cancellationReason;

    @Schema(description = "Actual start time (for providers to mark service start)", example = "2024-01-15T10:35:00")
    private LocalDateTime actualStartDateTime;

    @Schema(description = "Actual end time (for providers to mark service completion)", example = "2024-01-15T12:15:00")
    private LocalDateTime actualEndDateTime;

    // Constructors
    public BookingUpdateRequest() {}

    public BookingUpdateRequest(BookingStatus status) {
        this.status = status;
    }

    // Getters and Setters
    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
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

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getActualStartDateTime() {
        return actualStartDateTime;
    }

    public void setActualStartDateTime(LocalDateTime actualStartDateTime) {
        this.actualStartDateTime = actualStartDateTime;
    }

    public LocalDateTime getActualEndDateTime() {
        return actualEndDateTime;
    }

    public void setActualEndDateTime(LocalDateTime actualEndDateTime) {
        this.actualEndDateTime = actualEndDateTime;
    }
} 