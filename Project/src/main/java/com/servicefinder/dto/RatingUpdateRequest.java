package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Schema(description = "Request to update an existing rating and review")
public class RatingUpdateRequest {

    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must not exceed 5.0")
    @Schema(description = "Updated rating value from 1.0 to 5.0", example = "4.5", minimum = "1.0", maximum = "5.0")
    private BigDecimal rating;

    @Size(max = 1000, message = "Review must not exceed 1000 characters")
    @Schema(description = "Updated review text", example = "Updated review: Outstanding service with excellent attention to detail!")
    private String review;

    // Constructors
    public RatingUpdateRequest() {}

    public RatingUpdateRequest(BigDecimal rating) {
        this.rating = rating;
    }

    public RatingUpdateRequest(BigDecimal rating, String review) {
        this.rating = rating;
        this.review = review;
    }

    // Getters and Setters
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