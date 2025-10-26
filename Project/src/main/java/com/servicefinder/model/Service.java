package com.servicefinder.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "services")
public class Service extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_provider_id", nullable = false)
    private ServiceProvider serviceProvider;

    @NotBlank(message = "Service name is required")
    @Size(max = 100, message = "Service name must not exceed 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "subcategory")
    private String subcategory;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "service_area", length = 150)
    private String serviceArea; // e.g., "Chennai, Chennai District"

    @Column(name = "location_city", length = 100)
    private String locationCity;

    @Column(name = "location_district", length = 100)
    private String locationDistrict;

    @Column(name = "location_state", length = 100)
    private String locationState;

    @Column(name = "location_country", length = 100)
    private String locationCountry;

    @Column(name = "location_postal_code", length = 20)
    private String locationPostalCode;

    @Column(name = "location_latitude")
    private Double locationLatitude;

    @Column(name = "location_longitude")
    private Double locationLongitude;

    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm;

    // Relationships
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings = new HashSet<>();

    // Constructors
    public Service() {}

    public Service(ServiceProvider serviceProvider, String name, String description) {
        this.serviceProvider = serviceProvider;
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public ServiceProvider getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(ServiceProvider serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getLocationCity() { return locationCity; }
    public void setLocationCity(String locationCity) { this.locationCity = locationCity; }

    public String getLocationDistrict() { return locationDistrict; }
    public void setLocationDistrict(String locationDistrict) { this.locationDistrict = locationDistrict; }

    public String getLocationState() { return locationState; }
    public void setLocationState(String locationState) { this.locationState = locationState; }

    public String getLocationCountry() { return locationCountry; }
    public void setLocationCountry(String locationCountry) { this.locationCountry = locationCountry; }

    public String getLocationPostalCode() { return locationPostalCode; }
    public void setLocationPostalCode(String locationPostalCode) { this.locationPostalCode = locationPostalCode; }

    public Double getLocationLatitude() { return locationLatitude; }
    public void setLocationLatitude(Double locationLatitude) { this.locationLatitude = locationLatitude; }

    public Double getLocationLongitude() { return locationLongitude; }
    public void setLocationLongitude(Double locationLongitude) { this.locationLongitude = locationLongitude; }

    public Integer getServiceRadiusKm() { return serviceRadiusKm; }
    public void setServiceRadiusKm(Integer serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
} 