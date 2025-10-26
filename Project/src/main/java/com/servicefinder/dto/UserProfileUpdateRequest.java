package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "User profile update request")
public class UserProfileUpdateRequest {

    @Schema(description = "First name", example = "John")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @Schema(description = "Last name", example = "Doe")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    @Schema(description = "Phone number", example = "+1234567890")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Schema(description = "Address", example = "123 Main St")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Schema(description = "City", example = "New York")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Schema(description = "State", example = "NY")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Schema(description = "Postal code", example = "10001")
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @Schema(description = "Country", example = "USA")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    // Constructors
    public UserProfileUpdateRequest() {}

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
} 