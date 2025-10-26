package com.servicefinder.service;

import com.servicefinder.dto.AvailabilityCreateRequest;
import com.servicefinder.dto.AvailabilityResponse;
import com.servicefinder.dto.AvailabilitySearchRequest;
import com.servicefinder.dto.BulkAvailabilityCreateRequest;
import com.servicefinder.model.Availability;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.repository.AvailabilityRepository;
import com.servicefinder.repository.ServiceProviderRepository;
import com.servicefinder.repository.ServiceRepository;
import com.servicefinder.service.GeolocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private GeolocationService geolocationService;

    /**
     * Create a new availability slot for a service provider
     */
    public AvailabilityResponse createAvailability(Long providerId, AvailabilityCreateRequest request) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Service provider not found"));

        // Validate times
        if (request.getEndDateTime().isBefore(request.getStartDateTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Check for conflicts
        List<Availability> conflicts = availabilityRepository.findConflictingSlots(
            provider, request.getStartDateTime(), request.getEndDateTime()
        );
        if (!conflicts.isEmpty()) {
            // Provide detailed conflict information
            StringBuilder conflictDetails = new StringBuilder("Time slot conflicts with existing availability: ");
            for (Availability conflict : conflicts) {
                conflictDetails.append(String.format("[%s to %s%s], ", 
                    conflict.getStartDateTime().toString(),
                    conflict.getEndDateTime().toString(),
                    conflict.getIsBooked() ? " (BOOKED)" : " (AVAILABLE)"
                ));
            }
            String errorMessage = conflictDetails.toString();
            if (errorMessage.endsWith(", ")) {
                errorMessage = errorMessage.substring(0, errorMessage.length() - 2);
            }
            throw new RuntimeException(errorMessage);
        }

        // Create availability
        Availability availability = new Availability();
        availability.setServiceProvider(provider);
        availability.setStartDateTime(request.getStartDateTime());
        availability.setEndDateTime(request.getEndDateTime());
        availability.setIsRecurring(request.getIsRecurring());
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setRecurringStartTime(request.getRecurringStartTime());
        availability.setRecurringEndTime(request.getRecurringEndTime());
        availability.setNotes(request.getNotes());
        availability.setIsBooked(false);

        Availability saved = availabilityRepository.save(availability);
        return convertToResponse(saved, null);
    }

    /**
     * Create multiple availability slots for a service provider
     */
    public List<AvailabilityResponse> createBulkAvailability(Long providerId, BulkAvailabilityCreateRequest request) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Service provider not found"));

        System.out.println("=== BULK AVAILABILITY CREATION DEBUG ===");
        System.out.println("Provider ID: " + providerId);
        System.out.println("Start Date: " + request.getStartDate());
        System.out.println("End Date: " + request.getEndDate());
        System.out.println("Selected Days: " + request.getSelectedDays());
        System.out.println("Time Slots: " + request.getTimeSlots().size());

        List<Availability> savedAvailabilities = new ArrayList<>();
        
        // Generate slots for each selected day within the date range
        LocalDate currentDate = request.getStartDate();
        int dayCounter = 0;
        
        while (!currentDate.isAfter(request.getEndDate())) {
            dayCounter++;
            String dayName = currentDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            
            System.out.println("Day " + dayCounter + ": " + currentDate + " (" + dayName + ")");
            
            // Check if this day is in the selected days
            if (request.getSelectedDays().contains(dayName)) {
                System.out.println("  -> Day MATCHES selected days, creating " + request.getTimeSlots().size() + " slots");
                
                // Create slots for each time slot on this day
                for (int i = 0; i < request.getTimeSlots().size(); i++) {
                    BulkAvailabilityCreateRequest.TimeSlot timeSlot = request.getTimeSlots().get(i);
                    LocalDateTime startDateTime = currentDate.atTime(timeSlot.getStartTime());
                    LocalDateTime endDateTime = currentDate.atTime(timeSlot.getEndTime());
                    
                    System.out.println("    Slot " + (i + 1) + ": " + startDateTime + " to " + endDateTime);
                    
                    // Validate times
                    if (endDateTime.isBefore(startDateTime)) {
                        throw new RuntimeException("End time must be after start time");
                    }
                    
                    // Check for conflicts
                    List<Availability> conflicts = availabilityRepository.findConflictingSlots(
                        provider, startDateTime, endDateTime
                    );
                    if (conflicts.isEmpty()) { // Only create if no conflicts
                        Availability availability = new Availability();
                        availability.setServiceProvider(provider);
                        availability.setStartDateTime(startDateTime);
                        availability.setEndDateTime(endDateTime);
                        availability.setIsRecurring(false); // Bulk created slots are not recurring
                        availability.setDayOfWeek(null);
                        availability.setRecurringStartTime(null);
                        availability.setRecurringEndTime(null);
                        availability.setNotes(request.getNotes());
                        availability.setIsBooked(false);

                        savedAvailabilities.add(availabilityRepository.save(availability));
                        System.out.println("      -> CREATED successfully");
                    } else {
                        System.out.println("      -> SKIPPED due to " + conflicts.size() + " conflicts");
                    }
                }
            } else {
                System.out.println("  -> Day does NOT match selected days, skipping");
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        System.out.println("=== BULK CREATION COMPLETED ===");
        System.out.println("Total slots created: " + savedAvailabilities.size());
        System.out.println("Days processed: " + dayCounter);

        return savedAvailabilities.stream()
            .map(availability -> convertToResponse(availability, null))
            .collect(Collectors.toList());
    }

    /**
     * Search for available time slots based on criteria
     */
    public List<AvailabilityResponse> searchAvailability(AvailabilitySearchRequest request) {
        List<ServiceProvider> providers = new ArrayList<>();

        // Filter by specific provider if requested
        if (request.getProviderId() != null) {
            ServiceProvider provider = serviceProviderRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Service provider not found"));
            providers.add(provider);
        } else {
            // Get providers based on location and service type
            if (request.getLatitude() != null && request.getLongitude() != null) {
                double radius = request.getRadiusKm() != null ? request.getRadiusKm() : 20.0;
                providers = serviceProviderRepository.findProvidersWithinRadius(
                    request.getLatitude(), request.getLongitude(), radius
                );
            } else {
                providers = serviceProviderRepository.findByAvailableTrue();
            }

            // Filter by service type
            if (request.getServiceType() != null) {
                providers = providers.stream()
                    .filter(p -> hasServiceType(p, request.getServiceType()))
                    .collect(Collectors.toList());
            }
        }

        if (providers.isEmpty()) {
            return new ArrayList<>();
        }

        // Find available slots
        List<Availability> availableSlots;
        if (request.getDurationMinutes() != null) {
            // Search for slots with specific duration
            availableSlots = new ArrayList<>();
            for (ServiceProvider provider : providers) {
                List<Availability> providerSlots = availabilityRepository.findAvailableSlotsForDuration(
                    provider, request.getStartDate(), request.getEndDate(), request.getDurationMinutes()
                );
                availableSlots.addAll(providerSlots);
            }
        } else {
            // Search for any available slots in date range
            availableSlots = availabilityRepository.findAvailableSlotsByProvidersAndDate(
                providers, request.getStartDate(), request.getEndDate()
            );
        }

        // Convert to response with distance calculation
        List<AvailabilityResponse> responses = new ArrayList<>();
        for (Availability slot : availableSlots) {
            Double distance = null;
            if (request.getLatitude() != null && request.getLongitude() != null) {
                User providerUser = slot.getServiceProvider().getUser();
                if (providerUser.getLatitude() != null && providerUser.getLongitude() != null) {
                    distance = geolocationService.calculateDistance(
                        request.getLatitude(), request.getLongitude(),
                        providerUser.getLatitude(), providerUser.getLongitude()
                    );
                }
            }
            responses.add(convertToResponse(slot, distance));
        }

        // Apply limit if specified
        if (request.getLimit() != null && request.getLimit() > 0) {
            responses = responses.stream()
                .limit(request.getLimit())
                .collect(Collectors.toList());
        }

        // Sort by time if requested
        if (request.getSortByTime() != null && request.getSortByTime()) {
            responses.sort((a, b) -> a.getStartDateTime().compareTo(b.getStartDateTime()));
        }

        return responses;
    }

    /**
     * Get availability for a specific provider
     */
    public List<AvailabilityResponse> getProviderAvailability(Long providerId, LocalDateTime startDate, LocalDateTime endDate) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Service provider not found"));

        List<Availability> slots;
        if (startDate != null && endDate != null) {
            slots = availabilityRepository.findAvailableSlotsByProviderAndDateRange(provider, startDate, endDate);
        } else {
            // Get upcoming 7 days if no date range specified
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneWeekLater = now.plusDays(7);
            slots = availabilityRepository.findUpcomingAvailableSlots(provider, now, oneWeekLater);
        }

        return slots.stream()
            .map(slot -> convertToResponse(slot, null))
            .collect(Collectors.toList());
    }

    /**
     * Get availability for a specific provider, including booked slots (for provider dashboard)
     */
    public List<AvailabilityResponse> getProviderAvailabilityAll(Long providerId, LocalDateTime startDate, LocalDateTime endDate) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Service provider not found"));

        List<Availability> slots;
        if (startDate != null && endDate != null) {
            slots = availabilityRepository.findSlotsByProviderAndDateRange(provider, startDate, endDate);
        } else {
            slots = availabilityRepository.findByServiceProviderOrderByStartDateTimeAsc(provider);
        }

        return slots.stream()
            .map(slot -> convertToResponse(slot, null))
            .collect(Collectors.toList());
    }

    /**
     * Mark an availability slot as booked
     */
    public void markSlotAsBooked(Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
            .orElseThrow(() -> new RuntimeException("Availability slot not found"));
        
        if (availability.getIsBooked()) {
            throw new RuntimeException("Slot is already booked");
        }

        availability.setIsBooked(true);
        availabilityRepository.save(availability);
    }

    /**
     * Mark an availability slot as available (unbook)
     */
    public void markSlotAsAvailable(Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
            .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        availability.setIsBooked(false);
        availabilityRepository.save(availability);
    }

    /**
     * Delete availability slot
     */
    public void deleteAvailability(Long availabilityId, Long providerId) {
        Availability availability = availabilityRepository.findById(availabilityId)
            .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        if (!availability.getServiceProvider().getId().equals(providerId)) {
            throw new RuntimeException("Not authorized to delete this availability slot");
        }

        if (availability.getIsBooked()) {
            throw new RuntimeException("Cannot delete a booked slot");
        }

        availabilityRepository.delete(availability);
    }

    /**
     * Check if provider offers specific service type
     */
    private boolean hasServiceType(ServiceProvider provider, String serviceType) {
        List<com.servicefinder.model.Service> services = serviceRepository.findByServiceProvider(provider);
        return services.stream()
            .anyMatch(service -> service.getCategory().toLowerCase().contains(serviceType.toLowerCase()) ||
                               service.getName().toLowerCase().contains(serviceType.toLowerCase()));
    }

    /**
     * Convert Availability entity to AvailabilityResponse DTO
     */
    private AvailabilityResponse convertToResponse(Availability availability, Double distance) {
        AvailabilityResponse response = new AvailabilityResponse();
        response.setId(availability.getId());
        response.setStartDateTime(availability.getStartDateTime());
        response.setEndDateTime(availability.getEndDateTime());
        response.setDurationMinutes((int) Duration.between(availability.getStartDateTime(), availability.getEndDateTime()).toMinutes());
        response.setIsBooked(availability.getIsBooked());
        response.setIsRecurring(availability.getIsRecurring());
        response.setDayOfWeek(availability.getDayOfWeek());
        response.setRecurringStartTime(availability.getRecurringStartTime());
        response.setRecurringEndTime(availability.getRecurringEndTime());
        response.setNotes(availability.getNotes());
        response.setDistance(distance);
        response.setCreatedAt(availability.getCreatedAt());

        // Set provider info
        ServiceProvider provider = availability.getServiceProvider();
        User providerUser = provider.getUser();
        AvailabilityResponse.ProviderInfo providerInfo = new AvailabilityResponse.ProviderInfo(
            provider.getId(),
            provider.getBusinessName(),
            providerUser.getFirstName() + " " + providerUser.getLastName(),
            providerUser.getPhoneNumber(),
            provider.getAverageRating() != null ? provider.getAverageRating().doubleValue() : 0.0,
            provider.getYearsOfExperience(),
            provider.getVerificationStatus().toString()
        );
        response.setProvider(providerInfo);

        // Set available services
        List<com.servicefinder.model.Service> services = serviceRepository.findByServiceProvider(provider);
        List<AvailabilityResponse.ServiceInfo> serviceInfos = services.stream()
            .map(service -> new AvailabilityResponse.ServiceInfo(
                service.getId(),
                service.getName(),
                service.getCategory(),
                service.getPrice().toString(),
                service.getDurationMinutes()
            ))
            .collect(Collectors.toList());
        response.setAvailableServices(serviceInfos);

        return response;
    }
} 