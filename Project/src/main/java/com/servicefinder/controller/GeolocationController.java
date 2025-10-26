package com.servicefinder.controller;

import com.servicefinder.dto.LocationSearchRequest;
import com.servicefinder.dto.LocationSearchResponse;
import com.servicefinder.model.Service;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.service.GeolocationService;
import com.servicefinder.repository.ServiceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@Tag(name = "Geolocation Search", description = "Location-based search for service providers")
public class GeolocationController {

    @Autowired
    private GeolocationService geolocationService;

    @Autowired
    private ServiceRepository serviceRepository;

    @Operation(
        summary = "Search service providers by location",
        description = "Find service providers within a specified radius of a location with optional filtering"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Search completed successfully",
            content = @Content(schema = @Schema(implementation = LocationSearchResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    @PostMapping("/location")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN')")
    public ResponseEntity<LocationSearchResponse> searchByLocation(
            @Valid @RequestBody LocationSearchRequest request) {

        // Validate location
        if (!geolocationService.isValidLocation(request.getLatitude(), request.getLongitude())) {
            throw new IllegalArgumentException("Invalid location coordinates");
        }

        // Find providers within radius (considering service-level coordinates too)
        List<GeolocationService.ServiceProviderWithDistance> providersWithDistance = 
            geolocationService.findProvidersConsideringServiceCoordinates(
                request.getLatitude(), 
                request.getLongitude(), 
                request.getRadiusKm()
            );

        // Apply filters
        List<GeolocationService.ServiceProviderWithDistance> filteredProviders = 
            applyFilters(providersWithDistance, request);

        // Sort results
        if (request.getSortByDistance() != null && !request.getSortByDistance()) {
            // Sort by rating instead of distance
            filteredProviders = filteredProviders.stream()
                .sorted((p1, p2) -> {
                    BigDecimal rating1 = p1.getServiceProvider().getAverageRating();
                    BigDecimal rating2 = p2.getServiceProvider().getAverageRating();
                    if (rating1 == null) rating1 = BigDecimal.ZERO;
                    if (rating2 == null) rating2 = BigDecimal.ZERO;
                    return rating2.compareTo(rating1); // Descending order
                })
                .collect(Collectors.toList());
        }

        // Apply limit
        if (request.getLimit() != null && request.getLimit() > 0) {
            filteredProviders = filteredProviders.stream()
                .limit(request.getLimit())
                .collect(Collectors.toList());
        }

        // Convert to response DTOs
        List<LocationSearchResponse.ServiceProviderLocationInfo> providerInfos = 
            filteredProviders.stream()
                .map(this::convertToLocationInfo)
                .collect(Collectors.toList());

        // Create metadata
        LocationSearchResponse.SearchMetadata metadata = createSearchMetadata(
            request, providerInfos, filteredProviders);

        LocationSearchResponse response = new LocationSearchResponse(metadata, providerInfos);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Find providers within their service radius",
        description = "Find providers who can serve a specific location based on their configured service radius"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Search completed successfully",
            content = @Content(schema = @Schema(implementation = LocationSearchResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid coordinates"),
        @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN')")
    public ResponseEntity<LocationSearchResponse> findAvailableProviders(
            @Parameter(description = "Customer's latitude", example = "19.0760", required = true)
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            
            @Parameter(description = "Customer's longitude", example = "72.8777", required = true)
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude,
            
            @Parameter(description = "Minimum rating filter", example = "3.5")
            @RequestParam(required = false) @DecimalMin(value = "0.0") @DecimalMax(value = "5.0") Double minRating,
            
            @Parameter(description = "Service category filter", example = "Home Maintenance")
            @RequestParam(required = false) String category,
            
            @Parameter(description = "Maximum number of results", example = "20")
            @RequestParam(defaultValue = "50") @Positive Integer limit) {

        if (!geolocationService.isValidLocation(latitude, longitude)) {
            throw new IllegalArgumentException("Invalid location coordinates");
        }

        // Find providers who can serve this location
        List<GeolocationService.ServiceProviderWithDistance> providersWithDistance = 
            geolocationService.findAvailableServiceProviders(latitude, longitude);

        // Apply filters
        LocationSearchRequest filterRequest = new LocationSearchRequest();
        filterRequest.setMinRating(minRating);
        filterRequest.setCategory(category);
        filterRequest.setLimit(limit);

        List<GeolocationService.ServiceProviderWithDistance> filteredProviders = 
            applyFilters(providersWithDistance, filterRequest);

        // Convert to response DTOs
        List<LocationSearchResponse.ServiceProviderLocationInfo> providerInfos = 
            filteredProviders.stream()
                .map(this::convertToLocationInfo)
                .collect(Collectors.toList());

        // Create metadata
        LocationSearchResponse.SearchMetadata metadata = new LocationSearchResponse.SearchMetadata();
        metadata.setTotalResults(providerInfos.size());
        metadata.setSearchLatitude(latitude);
        metadata.setSearchLongitude(longitude);
        metadata.setSortedByDistance(true);

        if (!filteredProviders.isEmpty()) {
            DoubleSummaryStatistics distanceStats = filteredProviders.stream()
                .mapToDouble(GeolocationService.ServiceProviderWithDistance::getDistance)
                .summaryStatistics();
            metadata.setMinDistance(distanceStats.getMin());
            metadata.setMaxDistance(distanceStats.getMax());
        }

        LocationSearchResponse response = new LocationSearchResponse(metadata, providerInfos);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Calculate distance between two points",
        description = "Calculate the distance between two geographic points using the Haversine formula"
    )
    @GetMapping("/distance")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN')")
    public ResponseEntity<DistanceResponse> calculateDistance(
            @Parameter(description = "First point latitude", example = "19.0760", required = true)
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat1,
            
            @Parameter(description = "First point longitude", example = "72.8777", required = true)
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon1,
            
            @Parameter(description = "Second point latitude", example = "19.1136", required = true)
            @RequestParam @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double lat2,
            
            @Parameter(description = "Second point longitude", example = "72.8697", required = true)
            @RequestParam @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double lon2) {

        double distance = geolocationService.calculateDistance(lat1, lon1, lat2, lon2);
        
        DistanceResponse response = new DistanceResponse();
        response.setDistanceKm(distance);
        response.setDistanceMiles(distance * 0.621371); // Convert to miles
        response.setPoint1(new DistanceResponse.Point(lat1, lon1));
        response.setPoint2(new DistanceResponse.Point(lat2, lon2));

        return ResponseEntity.ok(response);
    }

    // Helper methods

    private List<GeolocationService.ServiceProviderWithDistance> applyFilters(
            List<GeolocationService.ServiceProviderWithDistance> providers, 
            LocationSearchRequest request) {
        
        return providers.stream()
            .filter(pwDistance -> {
                ServiceProvider provider = pwDistance.getServiceProvider();
                
                // Rating filter
                if (request.getMinRating() != null) {
                    BigDecimal rating = provider.getAverageRating();
                    if (rating == null || rating.doubleValue() < request.getMinRating()) {
                        return false;
                    }
                }
                
                // Category filter
                if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
                    boolean hasMatchingService = provider.getServices().stream()
                        .anyMatch(service -> request.getCategory().equalsIgnoreCase(service.getCategory()));
                    if (!hasMatchingService) {
                        return false;
                    }
                }
                
                // Subcategory filter
                if (request.getSubcategory() != null && !request.getSubcategory().trim().isEmpty()) {
                    boolean hasMatchingService = provider.getServices().stream()
                        .anyMatch(service -> request.getSubcategory().equalsIgnoreCase(service.getSubcategory()));
                    if (!hasMatchingService) {
                        return false;
                    }
                }
                
                // Price filter
                if (request.getMaxPrice() != null) {
                    boolean hasAffordableService = provider.getServices().stream()
                        .anyMatch(service -> service.getPrice().doubleValue() <= request.getMaxPrice());
                    if (!hasAffordableService) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
    }

    private LocationSearchResponse.ServiceProviderLocationInfo convertToLocationInfo(
            GeolocationService.ServiceProviderWithDistance providerWithDistance) {
        
        ServiceProvider provider = providerWithDistance.getServiceProvider();
        User user = provider.getUser();
        
        LocationSearchResponse.ServiceProviderLocationInfo info = 
            new LocationSearchResponse.ServiceProviderLocationInfo();
        
        // Basic provider information
        info.setId(provider.getId());
        info.setBusinessName(provider.getBusinessName());
        info.setDescription(provider.getDescription());
        info.setAverageRating(provider.getAverageRating() != null ? 
            provider.getAverageRating().doubleValue() : 0.0);
        info.setTotalRatings(provider.getTotalRatings());
        info.setYearsOfExperience(provider.getYearsOfExperience());
        info.setVerificationStatus(provider.getVerificationStatus().toString());
        info.setDistance(providerWithDistance.getDistance());
        info.setServiceRadiusKm(provider.getServiceRadiusKm() != null ? provider.getServiceRadiusKm().doubleValue() : 0.0);
        
        // Location information
        LocationSearchResponse.LocationInfo location = new LocationSearchResponse.LocationInfo(
            user.getCity(),
            user.getState(), 
            user.getCountry(),
            user.getLatitude(),
            user.getLongitude()
        );
        info.setLocation(location);
        
        // Contact information
        LocationSearchResponse.ContactInfo contact = new LocationSearchResponse.ContactInfo(
            user.getFirstName() + " " + user.getLastName(),
            user.getEmail(),
            user.getPhoneNumber()
        );
        info.setContact(contact);
        
        // Services information
        List<LocationSearchResponse.ServiceInfo> services = provider.getServices().stream()
            .map(service -> {
                LocationSearchResponse.ServiceInfo si = new LocationSearchResponse.ServiceInfo(
                    service.getId(),
                    service.getName(),
                    service.getCategory(),
                    service.getSubcategory(),
                    service.getPrice(),
                    service.getDurationMinutes()
                );
                // Populate service-level location for accurate display
                si.setServiceArea(service.getServiceArea());
                si.setCity(service.getLocationCity());
                si.setDistrict(service.getLocationDistrict());
                si.setLatitude(service.getLocationLatitude());
                si.setLongitude(service.getLocationLongitude());
                return si;
            })
            .collect(Collectors.toList());
        info.setServices(services);
        
        return info;
    }

    private LocationSearchResponse.SearchMetadata createSearchMetadata(
            LocationSearchRequest request, 
            List<LocationSearchResponse.ServiceProviderLocationInfo> providerInfos,
            List<GeolocationService.ServiceProviderWithDistance> filteredProviders) {
        
        LocationSearchResponse.SearchMetadata metadata = new LocationSearchResponse.SearchMetadata(
            providerInfos.size(),
            request.getLatitude(),
            request.getLongitude(),
            request.getRadiusKm(),
            request.getSortByDistance()
        );
        
        if (!filteredProviders.isEmpty()) {
            DoubleSummaryStatistics distanceStats = filteredProviders.stream()
                .mapToDouble(GeolocationService.ServiceProviderWithDistance::getDistance)
                .summaryStatistics();
            metadata.setMinDistance(distanceStats.getMin());
            metadata.setMaxDistance(distanceStats.getMax());
        }
        
        return metadata;
    }

    // Response DTO for distance calculation
    @Schema(description = "Distance calculation response")
    public static class DistanceResponse {
        @Schema(description = "Distance in kilometers", example = "5.23")
        private Double distanceKm;
        
        @Schema(description = "Distance in miles", example = "3.25")
        private Double distanceMiles;
        
        @Schema(description = "First point coordinates")
        private Point point1;
        
        @Schema(description = "Second point coordinates")
        private Point point2;

        // Getters and setters
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
        public Double getDistanceMiles() { return distanceMiles; }
        public void setDistanceMiles(Double distanceMiles) { this.distanceMiles = distanceMiles; }
        public Point getPoint1() { return point1; }
        public void setPoint1(Point point1) { this.point1 = point1; }
        public Point getPoint2() { return point2; }
        public void setPoint2(Point point2) { this.point2 = point2; }

        @Schema(description = "Geographic point")
        public static class Point {
            @Schema(description = "Latitude", example = "19.0760")
            private Double latitude;
            
            @Schema(description = "Longitude", example = "72.8777")
            private Double longitude;

            public Point() {}
            
            public Point(Double latitude, Double longitude) {
                this.latitude = latitude;
                this.longitude = longitude;
            }

            public Double getLatitude() { return latitude; }
            public void setLatitude(Double latitude) { this.latitude = latitude; }
            public Double getLongitude() { return longitude; }
            public void setLongitude(Double longitude) { this.longitude = longitude; }
        }
    }
} 