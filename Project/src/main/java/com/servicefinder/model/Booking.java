package com.servicefinder.model;

import com.servicefinder.model.enums.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @NotNull(message = "Scheduled date and time is required")
    @Column(name = "scheduled_datetime", nullable = false)
    private LocalDateTime scheduledDateTime;

    @Column(name = "estimated_end_datetime")
    private LocalDateTime estimatedEndDateTime;

    @Column(name = "actual_start_datetime")
    private LocalDateTime actualStartDateTime;

    @Column(name = "actual_end_datetime")
    private LocalDateTime actualEndDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "customer_address", length = 500)
    private String customerAddress;

    @Column(name = "customer_latitude")
    private Double customerLatitude;

    @Column(name = "customer_longitude")
    private Double customerLongitude;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "cancellation_datetime")
    private LocalDateTime cancellationDateTime;

    // Relationships
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Rating> ratings = new HashSet<>();

    // Constructors
    public Booking() {}

    public Booking(User customer, ServiceProvider serviceProvider, Service service, LocalDateTime scheduledDateTime) {
        this.customer = customer;
        this.serviceProvider = serviceProvider;
        this.service = service;
        this.scheduledDateTime = scheduledDateTime;
    }

    // Getters and Setters
    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public ServiceProvider getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(ServiceProvider serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public LocalDateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(LocalDateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public LocalDateTime getEstimatedEndDateTime() {
        return estimatedEndDateTime;
    }

    public void setEstimatedEndDateTime(LocalDateTime estimatedEndDateTime) {
        this.estimatedEndDateTime = estimatedEndDateTime;
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

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
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

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }

    public void setCancelledBy(String cancelledBy) {
        this.cancelledBy = cancelledBy;
    }

    public LocalDateTime getCancellationDateTime() {
        return cancellationDateTime;
    }

    public void setCancellationDateTime(LocalDateTime cancellationDateTime) {
        this.cancellationDateTime = cancellationDateTime;
    }

    public Set<Rating> getRatings() {
        return ratings;
    }

    public void setRatings(Set<Rating> ratings) {
        this.ratings = ratings;
    }

    // Utility methods
    public boolean canBeCancelled() {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }

    public boolean isCompleted() {
        return status == BookingStatus.COMPLETED;
    }

    public boolean isCancelled() {
        return status == BookingStatus.CANCELLED;
    }

    public boolean isInProgress() {
        return status == BookingStatus.IN_PROGRESS;
    }
} 