package com.servicefinder.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "availabilities")
public class Availability extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;

    @NotNull(message = "Start date and time is required")
    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time is required")
    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDateTime;

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    @Column(name = "recurring_start_time")
    private LocalTime recurringStartTime;

    @Column(name = "recurring_end_time")
    private LocalTime recurringEndTime;

    @Column(name = "is_booked", nullable = false)
    private Boolean isBooked = false;

    @Column(name = "notes")
    private String notes;

    // Constructors
    public Availability() {}

    public Availability(ServiceProvider serviceProvider, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        this.serviceProvider = serviceProvider;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    // Getters and Setters
    public ServiceProvider getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(ServiceProvider serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

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

    public Boolean getIsBooked() {
        return isBooked;
    }

    public void setIsBooked(Boolean isBooked) {
        this.isBooked = isBooked;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Utility methods
    public boolean isAvailable() {
        return !isBooked;
    }

    public boolean conflictsWith(LocalDateTime start, LocalDateTime end) {
        return startDateTime.isBefore(end) && endDateTime.isAfter(start);
    }
} 