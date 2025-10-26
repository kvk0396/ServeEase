package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Schema(description = "Request to create a new rating and review")
public class RatingCreateRequest {

    @NotNull(message = "Booking ID is required")
    @Schema(description = "ID of the booking to rate", example = "1")
    private Long bookingId;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    @Schema(description = "Rating value from 1.0 to 5.0", example = "4.5", minimum = "1.0", maximum = "5.0")
    private BigDecimal rating;

    @Size(max = 1000, message = "Review must not exceed 1000 characters")
    @Schema(description = "Optional review text", example = "Excellent service! Very professional and completed the work on time.")
    private String review;

    // Constructors
    public RatingCreateRequest() {}

    public RatingCreateRequest(Long bookingId, BigDecimal rating) {
        this.bookingId = bookingId;
        this.rating = rating;
    }

    public RatingCreateRequest(Long bookingId, BigDecimal rating, String review) {
        this.bookingId = bookingId;
        this.rating = rating;
        this.review = review;
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }
} 