package com.servicefinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Response for location-based search of service providers")
public class LocationSearchResponse {

    @Schema(description = "Search results metadata")
    private SearchMetadata metadata;

    @Schema(description = "List of service providers found")
    private List<ServiceProviderLocationInfo> providers;

    // Constructors
    public LocationSearchResponse() {}

    public LocationSearchResponse(SearchMetadata metadata, List<ServiceProviderLocationInfo> providers) {
        this.metadata = metadata;
        this.providers = providers;
    }

    // Getters and Setters
    public SearchMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(SearchMetadata metadata) {
        this.metadata = metadata;
    }

    public List<ServiceProviderLocationInfo> getProviders() {
        return providers;
    }

    public void setProviders(List<ServiceProviderLocationInfo> providers) {
        this.providers = providers;
    }

    @Schema(description = "Search metadata")
    public static class SearchMetadata {
        @Schema(description = "Number of results found", example = "15")
        private int totalResults;

        @Schema(description = "Search center latitude", example = "19.0760")
        private Double searchLatitude;

        @Schema(description = "Search center longitude", example = "72.8777")
        private Double searchLongitude;

        @Schema(description = "Search radius in kilometers", example = "10.0")
        private Double radiusKm;

        @Schema(description = "Whether results were sorted by distance", example = "true")
        private Boolean sortedByDistance;

        @Schema(description = "Maximum distance of results in kilometers", example = "9.2")
        private Double maxDistance;

        @Schema(description = "Minimum distance of results in kilometers", example = "0.5")
        private Double minDistance;

        // Constructors
        public SearchMetadata() {}

        public SearchMetadata(int totalResults, Double searchLatitude, Double searchLongitude, 
                            Double radiusKm, Boolean sortedByDistance) {
            this.totalResults = totalResults;
            this.searchLatitude = searchLatitude;
            this.searchLongitude = searchLongitude;
            this.radiusKm = radiusKm;
            this.sortedByDistance = sortedByDistance;
        }

        // Getters and Setters
        public int getTotalResults() { return totalResults; }
        public void setTotalResults(int totalResults) { this.totalResults = totalResults; }
        public Double getSearchLatitude() { return searchLatitude; }
        public void setSearchLatitude(Double searchLatitude) { this.searchLatitude = searchLatitude; }
        public Double getSearchLongitude() { return searchLongitude; }
        public void setSearchLongitude(Double searchLongitude) { this.searchLongitude = searchLongitude; }
        public Double getRadiusKm() { return radiusKm; }
        public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }
        public Boolean getSortedByDistance() { return sortedByDistance; }
        public void setSortedByDistance(Boolean sortedByDistance) { this.sortedByDistance = sortedByDistance; }
        public Double getMaxDistance() { return maxDistance; }
        public void setMaxDistance(Double maxDistance) { this.maxDistance = maxDistance; }
        public Double getMinDistance() { return minDistance; }
        public void setMinDistance(Double minDistance) { this.minDistance = minDistance; }
    }

    @Schema(description = "Service provider with location and distance information")
    public static class ServiceProviderLocationInfo {
        @Schema(description = "Provider ID", example = "1")
        private Long id;

        @Schema(description = "Business name", example = "Expert Electric Services")
        private String businessName;

        @Schema(description = "Business description", example = "Professional electrical services with 10+ years experience")
        private String description;

        @Schema(description = "Average rating", example = "4.8")
        private Double averageRating;

        @Schema(description = "Total number of ratings", example = "156")
        private Integer totalRatings;

        @Schema(description = "Years of experience", example = "10")
        private Integer yearsOfExperience;

        @Schema(description = "Verification status", example = "VERIFIED")
        private String verificationStatus;

        @Schema(description = "Distance from search center in kilometers", example = "2.3")
        private Double distance;

        @Schema(description = "Provider's service radius in kilometers", example = "15.0")
        private Double serviceRadiusKm;

        @Schema(description = "Provider location")
        private LocationInfo location;

        @Schema(description = "Available services")
        private List<ServiceInfo> services;

        @Schema(description = "Contact information")
        private ContactInfo contact;

        // Constructors
        public ServiceProviderLocationInfo() {}

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        public Integer getTotalRatings() { return totalRatings; }
        public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
        public Double getDistance() { return distance; }
        public void setDistance(Double distance) { this.distance = distance; }
        public Double getServiceRadiusKm() { return serviceRadiusKm; }
        public void setServiceRadiusKm(Double serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }
        public LocationInfo getLocation() { return location; }
        public void setLocation(LocationInfo location) { this.location = location; }
        public List<ServiceInfo> getServices() { return services; }
        public void setServices(List<ServiceInfo> services) { this.services = services; }
        public ContactInfo getContact() { return contact; }
        public void setContact(ContactInfo contact) { this.contact = contact; }
    }

    @Schema(description = "Location information")
    public static class LocationInfo {
        @Schema(description = "City", example = "Mumbai")
        private String city;

        @Schema(description = "State", example = "Maharashtra")
        private String state;

        @Schema(description = "Country", example = "India")
        private String country;

        @Schema(description = "Latitude", example = "19.0760")
        private Double latitude;

        @Schema(description = "Longitude", example = "72.8777")
        private Double longitude;

        // Constructors
        public LocationInfo() {}

        public LocationInfo(String city, String state, String country, Double latitude, Double longitude) {
            this.city = city;
            this.state = state;
            this.country = country;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        // Getters and Setters
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    @Schema(description = "Service information")
    public static class ServiceInfo {
        @Schema(description = "Service ID", example = "1")
        private Long id;

        @Schema(description = "Service name", example = "Electrical Wiring Installation")
        private String name;

        @Schema(description = "Service category", example = "Home Maintenance")
        private String category;

        @Schema(description = "Service subcategory", example = "Electrical")
        private String subcategory;

        @Schema(description = "Service price", example = "75.00")
        private BigDecimal price;

        @Schema(description = "Service duration in minutes", example = "120")
        private Integer durationMinutes;

        // Optional service-level location fields (to show accurate service area in search cards)
        @Schema(description = "Service area label", example = "Chennai, Chennai District")
        private String serviceArea;

        @Schema(description = "City for the service", example = "Chennai")
        private String city;

        @Schema(description = "District for the service", example = "Chennai District")
        private String district;

        @Schema(description = "Service latitude if specified", example = "12.9716")
        private Double latitude;

        @Schema(description = "Service longitude if specified", example = "77.5946")
        private Double longitude;

        // Constructors
        public ServiceInfo() {}

        public ServiceInfo(Long id, String name, String category, String subcategory, 
                          BigDecimal price, Integer durationMinutes) {
            this.id = id;
            this.name = name;
            this.category = category;
            this.subcategory = subcategory;
            this.price = price;
            this.durationMinutes = durationMinutes;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSubcategory() { return subcategory; }
        public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

        public String getServiceArea() { return serviceArea; }
        public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    @Schema(description = "Contact information")
    public static class ContactInfo {
        @Schema(description = "Full name", example = "Jane Smith")
        private String fullName;

        @Schema(description = "Email address", example = "jane@expertelectric.com")
        private String email;

        @Schema(description = "Phone number", example = "+1234567892")
        private String phoneNumber;

        // Constructors
        public ContactInfo() {}

        public ContactInfo(String fullName, String email, String phoneNumber) {
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
        }

        // Getters and Setters
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }
} 