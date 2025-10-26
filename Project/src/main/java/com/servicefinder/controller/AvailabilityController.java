package com.servicefinder.controller;

import com.servicefinder.dto.AvailabilityCreateRequest;
import com.servicefinder.dto.AvailabilityResponse;
import com.servicefinder.dto.AvailabilitySearchRequest;
import com.servicefinder.dto.BulkAvailabilityCreateRequest;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.model.enums.Role;
import com.servicefinder.repository.ServiceProviderRepository;
import com.servicefinder.repository.UserRepository;
import com.servicefinder.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/availability")
@Tag(name = "Availability Management", description = "APIs for managing service provider availability and real-time slot search")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    @PostMapping("/search")
    @Operation(
        summary = "Search available time slots",
        description = "Find available time slots based on location, service type, date range, and duration requirements"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available slots found successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AvailabilityResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid search criteria"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<AvailabilityResponse>> searchAvailability(
            @Valid @RequestBody AvailabilitySearchRequest request) {
        List<AvailabilityResponse> availableSlots = availabilityService.searchAvailability(request);
        return ResponseEntity.ok(availableSlots);
    }

    @PostMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(
        summary = "Create availability slot",
        description = "Create a new availability slot for a service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Availability slot created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid availability data or time conflict"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    public ResponseEntity<AvailabilityResponse> createAvailability(
            @Parameter(description = "Service provider ID", required = true)
            @PathVariable Long providerId,
            @Valid @RequestBody AvailabilityCreateRequest request,
            Authentication authentication) {
        
        // Verify that the authenticated user owns this service provider profile
        User currentUser = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getServiceProvider() == null || 
            !currentUser.getServiceProvider().getId().equals(providerId)) {
            throw new RuntimeException("Access denied: You can only create availability for your own profile");
        }
        
        AvailabilityResponse response = availabilityService.createAvailability(providerId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk-create")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(
        summary = "Create multiple availability slots",
        description = "Create multiple availability slots for the authenticated service provider based on date range and time patterns"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bulk availability slots created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid bulk availability data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied - not a service provider")
    })
    public ResponseEntity<List<AvailabilityResponse>> createBulkAvailability(
            @Valid @RequestBody BulkAvailabilityCreateRequest request,
            Authentication authentication) {
        
        try {
            User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user has SERVICE_PROVIDER role
            if (currentUser.getRole() != Role.SERVICE_PROVIDER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Find the ServiceProvider entity for this user
            ServiceProvider serviceProvider = serviceProviderRepository.findByUser(currentUser)
                .orElse(null);
            
            if (serviceProvider == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Long providerId = serviceProvider.getId();
            List<AvailabilityResponse> responses = availabilityService.createBulkAvailability(providerId, request);
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/provider/{providerId}")
    @Operation(
        summary = "Get provider availability",
        description = "Get all available time slots for a specific service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Provider availability retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    public ResponseEntity<List<AvailabilityResponse>> getProviderAvailability(
            @Parameter(description = "Service provider ID", required = true)
            @PathVariable Long providerId,
            @Parameter(description = "Start date for search (optional)", example = "2025-08-10T00:00:00")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for search (optional)", example = "2025-08-17T23:59:59")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<AvailabilityResponse> availability = availabilityService.getProviderAvailability(providerId, startDate, endDate);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/my-availability")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(
        summary = "Get my availability",
        description = "Get all availability slots for the authenticated service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Availability retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied - not a service provider")
    })
    public ResponseEntity<List<AvailabilityResponse>> getMyAvailability(
            @Parameter(description = "Start date for search (optional)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for search (optional)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        
        User currentUser = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long providerId = currentUser.getServiceProvider().getId();
        List<AvailabilityResponse> availability = availabilityService.getProviderAvailability(providerId, startDate, endDate);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/my-availability/all")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(
        summary = "Get my availability (all)",
        description = "Get all availability slots, including booked ones, for the authenticated service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Availability retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied - not a service provider")
    })
    public ResponseEntity<List<AvailabilityResponse>> getMyAvailabilityAll(
            @Parameter(description = "Start date for search (optional)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for search (optional)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Long providerId = currentUser.getServiceProvider().getId();
        List<AvailabilityResponse> availability = availabilityService.getProviderAvailabilityAll(providerId, startDate, endDate);
        return ResponseEntity.ok(availability);
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(
        summary = "Create availability slot for current provider",
        description = "Create a new availability slot for the authenticated service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Availability slot created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid availability data or time conflict"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied - not a service provider")
    })
    public ResponseEntity<AvailabilityResponse> createMyAvailability(
            @Valid @RequestBody AvailabilityCreateRequest request,
            Authentication authentication) {
        
        try {
            User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user has SERVICE_PROVIDER role
            if (currentUser.getRole() != Role.SERVICE_PROVIDER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Find the ServiceProvider entity for this user
            ServiceProvider serviceProvider = serviceProviderRepository.findByUser(currentUser)
                .orElse(null);
            
            if (serviceProvider == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Long providerId = serviceProvider.getId();
            AvailabilityResponse response = availabilityService.createAvailability(providerId, request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{availabilityId}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    @Operation(
        summary = "Delete availability slot",
        description = "Delete an availability slot (only if not booked)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Availability slot deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot delete booked slot"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Availability slot not found")
    })
    public ResponseEntity<Void> deleteAvailability(
            @Parameter(description = "Availability slot ID", required = true)
            @PathVariable Long availabilityId,
            Authentication authentication) {
        
        User currentUser = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Long providerId = currentUser.getServiceProvider() != null ? 
            currentUser.getServiceProvider().getId() : null;
        
        availabilityService.deleteAvailability(availabilityId, providerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{availabilityId}/book")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    @Operation(
        summary = "Mark slot as booked",
        description = "Mark an availability slot as booked (typically called when a booking is created)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slot marked as booked successfully"),
        @ApiResponse(responseCode = "400", description = "Slot is already booked"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Availability slot not found")
    })
    public ResponseEntity<Void> markSlotAsBooked(
            @Parameter(description = "Availability slot ID", required = true)
            @PathVariable Long availabilityId) {
        availabilityService.markSlotAsBooked(availabilityId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{availabilityId}/unbook")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    @Operation(
        summary = "Mark slot as available",
        description = "Mark a booked slot as available again (typically called when a booking is cancelled)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Slot marked as available successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Availability slot not found")
    })
    public ResponseEntity<Void> markSlotAsAvailable(
            @Parameter(description = "Availability slot ID", required = true)
            @PathVariable Long availabilityId) {
        availabilityService.markSlotAsAvailable(availabilityId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/quick")
    @Operation(
        summary = "Quick availability search",
        description = "Quick search for available slots with simplified parameters"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available slots found successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    public ResponseEntity<List<AvailabilityResponse>> quickAvailabilitySearch(
            @Parameter(description = "Service type to search for", example = "plumbing")
            @RequestParam(required = false) String serviceType,
            @Parameter(description = "Customer latitude", example = "19.0760")
            @RequestParam(required = false) Double latitude,
            @Parameter(description = "Customer longitude", example = "72.8777")
            @RequestParam(required = false) Double longitude,
            @Parameter(description = "Search radius in km", example = "15.0")
            @RequestParam(required = false, defaultValue = "20.0") Double radiusKm,
            @Parameter(description = "Duration needed in minutes", example = "120")
            @RequestParam(required = false) Integer durationMinutes,
            @Parameter(description = "Number of days to search ahead", example = "7")
            @RequestParam(required = false, defaultValue = "7") Integer daysAhead,
            @Parameter(description = "Maximum results to return", example = "20")
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        
        AvailabilitySearchRequest request = new AvailabilitySearchRequest();
        request.setServiceType(serviceType);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setRadiusKm(radiusKm);
        request.setDurationMinutes(durationMinutes);
        request.setLimit(limit);
        
        // Set date range for next N days
        LocalDateTime now = LocalDateTime.now();
        request.setStartDate(now);
        request.setEndDate(now.plusDays(daysAhead));
        
        List<AvailabilityResponse> availableSlots = availabilityService.searchAvailability(request);
        return ResponseEntity.ok(availableSlots);
    }

    @GetMapping("/providers/available-today")
    @Operation(
        summary = "Get providers available today",
        description = "Find all service providers who have availability slots today"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Providers with availability found successfully")
    })
    public ResponseEntity<List<AvailabilityResponse>> getProvidersAvailableToday(
            @Parameter(description = "Service type filter", example = "plumbing")
            @RequestParam(required = false) String serviceType,
            @Parameter(description = "Customer latitude for distance filtering", example = "19.0760")
            @RequestParam(required = false) Double latitude,
            @Parameter(description = "Customer longitude for distance filtering", example = "72.8777")
            @RequestParam(required = false) Double longitude,
            @Parameter(description = "Search radius in km", example = "25.0")
            @RequestParam(required = false, defaultValue = "50.0") Double radiusKm) {
        
        AvailabilitySearchRequest request = new AvailabilitySearchRequest();
        request.setServiceType(serviceType);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setRadiusKm(radiusKm);
        
        // Set today's date range
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfToday = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        request.setStartDate(startOfToday);
        request.setEndDate(endOfToday);
        
        List<AvailabilityResponse> availableSlots = availabilityService.searchAvailability(request);
        return ResponseEntity.ok(availableSlots);
    }
} 