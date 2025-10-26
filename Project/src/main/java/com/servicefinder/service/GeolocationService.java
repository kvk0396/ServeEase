package com.servicefinder.service;

import com.servicefinder.model.User;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.repository.UserRepository;
import com.servicefinder.repository.ServiceProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class GeolocationService {
    
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    /**
     * Calculate the distance between two points using the Haversine formula
     * This implementation provides high accuracy for distances up to about 20,000 km
     * @param lat1 Latitude of first point in decimal degrees
     * @param lon1 Longitude of first point in decimal degrees
     * @param lat2 Latitude of second point in decimal degrees
     * @param lon2 Longitude of second point in decimal degrees
     * @return Distance in kilometers, or Double.MAX_VALUE if any coordinate is invalid
     */
    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        // Validate input coordinates
        if (!isValidLocation(lat1, lon1) || !isValidLocation(lat2, lon2)) {
            return Double.MAX_VALUE;
        }
        
        // Convert to double primitives for better performance
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLatRad = Math.toRadians(lat2 - lat1);
        double deltaLonRad = Math.toRadians(lon2 - lon1);
        
        // Haversine formula - more accurate implementation
        double a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
        
        // Use atan2 for better numerical stability
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Calculate distance using more precise Earth radius
        double distance = EARTH_RADIUS_KM * c;
        
        // Round to 3 decimal places for consistency (meter precision)
        return Math.round(distance * 1000.0) / 1000.0;
    }

    /**
     * Find users within a specified radius of a location
     */
    public List<User> findUsersWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        return userRepository.findUsersWithinRadius(latitude, longitude, radiusKm);
    }

    /**
     * Find service providers within a specified radius of a location
     */
    public List<ServiceProvider> findServiceProvidersWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        List<User> nearbyUsers = findUsersWithinRadius(latitude, longitude, radiusKm);
        
        return nearbyUsers.stream()
                .filter(user -> user.getServiceProvider() != null && user.getServiceProvider().getAvailable())
                .map(User::getServiceProvider)
                .collect(Collectors.toList());
    }

    /**
     * Find service providers within radius and sort by distance
     */
    public List<ServiceProviderWithDistance> findServiceProvidersWithinRadiusSortedByDistance(
            Double latitude, Double longitude, Double radiusKm) {
        
        List<ServiceProvider> providers = findServiceProvidersWithinRadius(latitude, longitude, radiusKm);
        
        return providers.stream()
                .map(provider -> {
                    User user = provider.getUser();
                    double distance = calculateDistance(latitude, longitude, user.getLatitude(), user.getLongitude());
                    return new ServiceProviderWithDistance(provider, distance);
                })
                .sorted(Comparator.comparing(ServiceProviderWithDistance::getDistance))
                .collect(Collectors.toList());
    }

    /**
     * Find service providers within a radius, considering both provider's user coordinates
     * and any service-level coordinates. The distance used is the minimum of these.
     */
    public List<ServiceProviderWithDistance> findProvidersConsideringServiceCoordinates(
            Double latitude, Double longitude, Double radiusKm) {
        // Fetch all available providers and compute distance using the closest known coordinates
        List<ServiceProvider> providers = serviceProviderRepository.findByAvailableTrue();

        return providers.stream()
                .map(provider -> {
                    User user = provider.getUser();

                    double minDistance = Double.MAX_VALUE;

                    // Consider provider's user coordinates if available
                    if (user != null && user.getLatitude() != null && user.getLongitude() != null) {
                        minDistance = Math.min(minDistance,
                                calculateDistance(latitude, longitude, user.getLatitude(), user.getLongitude()));
                    }

                    // Consider each service's own coordinates if present
                    if (provider.getServices() != null) {
                        for (com.servicefinder.model.Service svc : provider.getServices()) {
                            Double svcLat = null;
                            Double svcLon = null;
                            try {
                                svcLat = svc.getLocationLatitude();
                                svcLon = svc.getLocationLongitude();
                            } catch (Exception e) {
                                // if getters are absent or entity lacks fields, skip
                            }
                            if (svcLat != null && svcLon != null) {
                                minDistance = Math.min(minDistance,
                                        calculateDistance(latitude, longitude, svcLat, svcLon));
                            }
                        }
                    }

                    return new ServiceProviderWithDistance(provider, minDistance);
                })
                .filter(pwd -> pwd.getDistance() <= (radiusKm != null ? radiusKm : 0))
                .sorted(Comparator.comparing(ServiceProviderWithDistance::getDistance))
                .collect(Collectors.toList());
    }

    /**
     * Find service providers within their service radius
     * (Providers can specify how far they're willing to travel)
     */
    public List<ServiceProviderWithDistance> findAvailableServiceProviders(Double customerLat, Double customerLon) {
        List<ServiceProvider> allProviders = serviceProviderRepository.findByAvailableTrue();
        
        return allProviders.stream()
                .filter(provider -> {
                    User user = provider.getUser();
                    if (user.getLatitude() == null || user.getLongitude() == null) {
                        return false;
                    }
                    
                    double distance = calculateDistance(customerLat, customerLon, 
                                                      user.getLatitude(), user.getLongitude());
                    
                    // Check if customer is within provider's service radius
                    return distance <= provider.getServiceRadiusKm();
                })
                .map(provider -> {
                    User user = provider.getUser();
                    double distance = calculateDistance(customerLat, customerLon, 
                                                      user.getLatitude(), user.getLongitude());
                    return new ServiceProviderWithDistance(provider, distance);
                })
                .sorted(Comparator.comparing(ServiceProviderWithDistance::getDistance))
                .collect(Collectors.toList());
    }

    /**
     * Check if a location is valid (has both latitude and longitude)
     */
    public boolean isValidLocation(Double latitude, Double longitude) {
        return latitude != null && longitude != null &&
               latitude >= -90 && latitude <= 90 &&
               longitude >= -180 && longitude <= 180;
    }

    /**
     * Get the bounding box for a given center point and radius
     * Uses more accurate calculation for latitude/longitude degree conversions
     * Useful for optimizing database queries
     */
    public BoundingBox getBoundingBox(Double centerLat, Double centerLon, Double radiusKm) {
        if (!isValidLocation(centerLat, centerLon) || radiusKm == null || radiusKm <= 0) {
            return null;
        }

        // More accurate conversion: 1 degree latitude ≈ 111.32 km
        double latOffset = radiusKm / 111.32;
        
        // Longitude degree distance varies by latitude
        // At the equator: 1 degree longitude ≈ 111.32 km
        // At latitude φ: 1 degree longitude ≈ 111.32 * cos(φ) km
        double lonOffset = radiusKm / (111.32 * Math.cos(Math.toRadians(centerLat)));

        // Ensure bounding box stays within valid coordinate ranges
        double minLat = Math.max(-90.0, centerLat - latOffset);
        double maxLat = Math.min(90.0, centerLat + latOffset);
        double minLon = Math.max(-180.0, centerLon - lonOffset);
        double maxLon = Math.min(180.0, centerLon + lonOffset);

        return new BoundingBox(minLat, maxLat, minLon, maxLon);
    }

    /**
     * DTO for service provider with calculated distance
     */
    public static class ServiceProviderWithDistance {
        private final ServiceProvider serviceProvider;
        private final double distance;

        public ServiceProviderWithDistance(ServiceProvider serviceProvider, double distance) {
            this.serviceProvider = serviceProvider;
            this.distance = distance;
        }

        public ServiceProvider getServiceProvider() {
            return serviceProvider;
        }

        public double getDistance() {
            return distance;
        }
    }

    /**
     * DTO for geographic bounding box
     */
    public static class BoundingBox {
        private final double minLatitude;
        private final double maxLatitude;
        private final double minLongitude;
        private final double maxLongitude;

        public BoundingBox(double minLatitude, double maxLatitude, double minLongitude, double maxLongitude) {
            this.minLatitude = minLatitude;
            this.maxLatitude = maxLatitude;
            this.minLongitude = minLongitude;
            this.maxLongitude = maxLongitude;
        }

        public double getMinLatitude() { return minLatitude; }
        public double getMaxLatitude() { return maxLatitude; }
        public double getMinLongitude() { return minLongitude; }
        public double getMaxLongitude() { return maxLongitude; }
    }
} 