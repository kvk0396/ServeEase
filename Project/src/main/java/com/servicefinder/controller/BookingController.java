package com.servicefinder.controller;

import com.servicefinder.dto.BookingCreateRequest;
import com.servicefinder.dto.BookingResponse;
import com.servicefinder.dto.BookingUpdateRequest;
import com.servicefinder.model.*;
import com.servicefinder.model.enums.BookingStatus;
import com.servicefinder.model.enums.Role;
import com.servicefinder.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
@Tag(name = "Booking Management", description = "APIs for managing service bookings")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    // Create a new booking
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a new booking", description = "Customer can book a service from a provider")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Booking created successfully",
                content = @Content(schema = @Schema(implementation = BookingResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid booking request or time conflict"),
        @ApiResponse(responseCode = "403", description = "Only customers can create bookings"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        
        try {
            // Get the authenticated customer
            User customer = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // Get the service
            Service service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found"));

            // Get the service provider
            ServiceProvider serviceProvider = service.getServiceProvider();

            // Calculate estimated end time
            LocalDateTime estimatedEndTime = request.getScheduledDateTime()
                    .plusMinutes(service.getDurationMinutes() != null ? service.getDurationMinutes() : 60);

            // Check for booking conflicts
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    serviceProvider, request.getScheduledDateTime(), estimatedEndTime);
            
            if (!conflicts.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Time slot not available. Provider has a conflicting booking.");
            }

            // Create the booking
            Booking booking = new Booking();
            booking.setCustomer(customer);
            booking.setServiceProvider(serviceProvider);
            booking.setService(service);
            booking.setScheduledDateTime(request.getScheduledDateTime());
            booking.setEstimatedEndDateTime(estimatedEndTime);
            booking.setStatus(BookingStatus.PENDING);
            booking.setTotalPrice(service.getPrice());
            booking.setNotes(request.getNotes());
            booking.setCustomerAddress(request.getCustomerAddress());
            booking.setCustomerLatitude(request.getCustomerLatitude());
            booking.setCustomerLongitude(request.getCustomerLongitude());

            Booking savedBooking = bookingRepository.save(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedBooking));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }

    // Get booking by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    @Operation(summary = "Get booking by ID", description = "Retrieve a specific booking by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking found",
                content = @Content(schema = @Schema(implementation = BookingResponse.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - can only view own bookings"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<?> getBookingById(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            Authentication authentication) {
        
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check access permissions
        boolean hasAccess = currentUser.getRole() == Role.ADMIN ||
                           booking.getCustomer().getId().equals(currentUser.getId()) ||
                           (currentUser.getRole() == Role.SERVICE_PROVIDER && 
                            booking.getServiceProvider().getUser().getId().equals(currentUser.getId()));

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only view your own bookings.");
        }

        return ResponseEntity.ok(convertToResponse(booking));
    }

    // Get customer's bookings
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer's bookings", description = "Retrieve all bookings for the authenticated customer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Only customers can access this endpoint")
    })
    public ResponseEntity<Page<BookingResponse>> getCustomerBookings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filter by status") @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        
        User customer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings;

        if (status != null) {
            List<Booking> bookingList = bookingRepository.findByCustomerAndStatusOrderByScheduledDateTimeDesc(customer, status);
            // Convert list to page with proper pagination
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), bookingList.size());
            List<Booking> pageContent = start < bookingList.size() ? bookingList.subList(start, end) : new ArrayList<>();
            bookings = new PageImpl<>(pageContent, pageable, bookingList.size());
        } else {
            bookings = bookingRepository.findByCustomerOrderByScheduledDateTimeDesc(customer, pageable);
        }

        Page<BookingResponse> response = bookings.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    // Get customer's bookings (alternative endpoint for frontend compatibility)
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer's bookings", description = "Retrieve all bookings for the authenticated customer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Only customers can access this endpoint")
    })
    public ResponseEntity<Page<BookingResponse>> getCustomerBookingsAlternative(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filter by status") @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        
        return getCustomerBookings(page, size, status, authentication);
    }

    // Get provider's bookings
    @GetMapping("/provider-bookings")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Get provider's bookings", description = "Retrieve all bookings for the authenticated service provider")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Only service providers can access this endpoint")
    })
    public ResponseEntity<Page<BookingResponse>> getProviderBookings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filter by status") @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        
        User providerUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository.findByUser(providerUser)
                .orElseThrow(() -> new RuntimeException("Service provider profile not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findByServiceProviderOrderByScheduledDateTimeDesc(provider, pageable);

        Page<BookingResponse> response = bookings.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    // Get upcoming bookings
    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Get upcoming bookings", description = "Retrieve upcoming bookings for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Upcoming bookings retrieved successfully")
    })
    public ResponseEntity<List<BookingResponse>> getUpcomingBookings(Authentication authentication) {
        
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> upcomingBookings;
        LocalDateTime now = LocalDateTime.now();

        if (currentUser.getRole() == Role.CUSTOMER) {
            upcomingBookings = bookingRepository.findUpcomingBookingsByCustomer(currentUser, now);
        } else { // SERVICE_PROVIDER
            ServiceProvider provider = serviceProviderRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Service provider profile not found"));
            upcomingBookings = bookingRepository.findUpcomingBookingsByProvider(provider, now);
        }

        List<BookingResponse> response = upcomingBookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Update booking
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Update booking", description = "Update booking status or details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking updated successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied or invalid status transition"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<?> updateBooking(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @Valid @RequestBody BookingUpdateRequest request,
            Authentication authentication) {
        
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check permissions and validate status transitions
        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isProvider = currentUser.getRole() == Role.SERVICE_PROVIDER && 
                           booking.getServiceProvider().getUser().getId().equals(currentUser.getId());

        if (!isCustomer && !isProvider) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only update your own bookings.");
        }

        // Apply updates based on request
        if (request.getStatus() != null) {
            if (!isValidStatusTransition(booking.getStatus(), request.getStatus(), isCustomer, isProvider)) {
                return ResponseEntity.badRequest()
                        .body("Invalid status transition or insufficient permissions.");
            }
            booking.setStatus(request.getStatus());

            // Handle cancellation
            if (request.getStatus() == BookingStatus.CANCELLED) {
                booking.setCancellationReason(request.getCancellationReason());
                booking.setCancelledBy(isCustomer ? "customer" : "provider");
                booking.setCancellationDateTime(LocalDateTime.now());
            }
        }

        if (request.getScheduledDateTime() != null && isCustomer && booking.canBeCancelled()) {
            booking.setScheduledDateTime(request.getScheduledDateTime());
        }

        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes());
        }

        if (request.getActualStartDateTime() != null && isProvider) {
            booking.setActualStartDateTime(request.getActualStartDateTime());
        }

        if (request.getActualEndDateTime() != null && isProvider) {
            booking.setActualEndDateTime(request.getActualEndDateTime());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(convertToResponse(updatedBooking));
    }

    // Update booking status (simplified endpoint for frontend compatibility)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Update booking status", description = "Update booking status - providers can confirm/complete, customers can cancel")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "403", description = "Access denied or insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<?> updateBookingStatus(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @Valid @RequestBody BookingUpdateRequest request,
            Authentication authentication) {
        
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isProvider = currentUser.getRole() == Role.SERVICE_PROVIDER && 
                           booking.getServiceProvider().getUser().getId().equals(currentUser.getId());

        if (!isCustomer && !isProvider) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update bookings you are involved in.");
        }

        // Validate status transitions based on user role
        BookingStatus newStatus = request.getStatus();
        BookingStatus currentStatus = booking.getStatus();

        // Service providers can: PENDING -> CONFIRMED, CONFIRMED -> IN_PROGRESS, IN_PROGRESS -> COMPLETED
        if (isProvider && !isCustomer) {
            if (currentStatus == BookingStatus.PENDING && newStatus == BookingStatus.CONFIRMED) {
                // Valid: Provider confirming booking
            } else if (currentStatus == BookingStatus.CONFIRMED && newStatus == BookingStatus.IN_PROGRESS) {
                // Valid: Provider starting service
                if (request.getActualStartDateTime() == null) {
                    booking.setActualStartDateTime(LocalDateTime.now());
                }
            } else if (currentStatus == BookingStatus.IN_PROGRESS && newStatus == BookingStatus.COMPLETED) {
                // Valid: Provider completing service
                if (request.getActualEndDateTime() == null) {
                    booking.setActualEndDateTime(LocalDateTime.now());
                }
            } else if (newStatus == BookingStatus.CANCELLED) {
                // Provider can cancel with reason
                booking.setCancellationReason(request.getCancellationReason());
                booking.setCancelledBy("provider");
                booking.setCancellationDateTime(LocalDateTime.now());
            } else {
                return ResponseEntity.badRequest()
                        .body("Invalid status transition. Providers can only confirm pending bookings, start confirmed bookings, complete in-progress bookings, or cancel.");
            }
        }

        // Customers can: cancel any non-completed booking
        if (isCustomer && !isProvider) {
            if (newStatus == BookingStatus.CANCELLED && currentStatus != BookingStatus.COMPLETED) {
                booking.setCancellationReason(request.getCancellationReason());
                booking.setCancelledBy("customer");
                booking.setCancellationDateTime(LocalDateTime.now());
            } else {
                return ResponseEntity.badRequest()
                        .body("Customers can only cancel non-completed bookings.");
            }
        }

        booking.setStatus(newStatus);
        
        // Update notes if provided
        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(convertToResponse(updatedBooking));
    }

    // Cancel booking
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Cancel booking", description = "Cancel a booking with a reason")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Booking cannot be cancelled"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<?> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            @Parameter(description = "Cancellation reason") @RequestParam String reason,
            Authentication authentication) {
        
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check permissions
        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isProvider = currentUser.getRole() == Role.SERVICE_PROVIDER && 
                           booking.getServiceProvider().getUser().getId().equals(currentUser.getId());

        if (!isCustomer && !isProvider) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only cancel your own bookings.");
        }

        if (!booking.canBeCancelled()) {
            return ResponseEntity.badRequest()
                    .body("Booking cannot be cancelled. Current status: " + booking.getStatus());
        }

        // Cancel the booking
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(isCustomer ? "customer" : "provider");
        booking.setCancellationDateTime(LocalDateTime.now());

        Booking cancelledBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(convertToResponse(cancelledBooking));
    }

    // Mark service as started (Provider only)
    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Start service", description = "Provider marks the service as started")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service marked as started"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "403", description = "Only the assigned provider can start the service")
    })
    public ResponseEntity<?> startService(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            Authentication authentication) {
        
        return updateBookingStatus(id, BookingStatus.IN_PROGRESS, authentication, true);
    }

    // Mark service as completed (Provider only)
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Complete service", description = "Provider marks the service as completed")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service marked as completed"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "403", description = "Only the assigned provider can complete the service")
    })
    public ResponseEntity<?> completeService(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            Authentication authentication) {
        
        return updateBookingStatus(id, BookingStatus.COMPLETED, authentication, true);
    }

    // Confirm booking (Provider only)
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('SERVICE_PROVIDER')")
    @Operation(summary = "Confirm booking", description = "Provider confirms the booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking confirmed"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "403", description = "Only the assigned provider can confirm the booking")
    })
    public ResponseEntity<?> confirmBooking(
            @Parameter(description = "Booking ID") @PathVariable Long id,
            Authentication authentication) {
        
        return updateBookingStatus(id, BookingStatus.CONFIRMED, authentication, true);
    }

    // Helper method to update booking status
    private ResponseEntity<?> updateBookingStatus(Long id, BookingStatus newStatus, Authentication authentication, boolean providerOnly) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (providerOnly) {
            boolean isProvider = currentUser.getRole() == Role.SERVICE_PROVIDER && 
                               booking.getServiceProvider().getUser().getId().equals(currentUser.getId());
            if (!isProvider) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only the assigned provider can perform this action.");
            }
        }

        // Validate status transition
        if (!isValidStatusTransition(booking.getStatus(), newStatus, false, providerOnly)) {
            return ResponseEntity.badRequest()
                    .body("Invalid status transition from " + booking.getStatus() + " to " + newStatus);
        }

        booking.setStatus(newStatus);
        
        // Set actual times for service start/completion
        if (newStatus == BookingStatus.IN_PROGRESS) {
            booking.setActualStartDateTime(LocalDateTime.now());
        } else if (newStatus == BookingStatus.COMPLETED) {
            booking.setActualEndDateTime(LocalDateTime.now());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(convertToResponse(updatedBooking));
    }

    // Helper method to validate status transitions
    private boolean isValidStatusTransition(BookingStatus currentStatus, BookingStatus newStatus, boolean isCustomer, boolean isProvider) {
        switch (currentStatus) {
            case PENDING:
                if (isProvider) {
                    return newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.CANCELLED;
                }
                if (isCustomer) {
                    return newStatus == BookingStatus.CANCELLED;
                }
                break;
            case CONFIRMED:
                if (isProvider) {
                    return newStatus == BookingStatus.IN_PROGRESS || newStatus == BookingStatus.CANCELLED;
                }
                if (isCustomer) {
                    return newStatus == BookingStatus.CANCELLED;
                }
                break;
            case IN_PROGRESS:
                if (isProvider) {
                    return newStatus == BookingStatus.COMPLETED || newStatus == BookingStatus.CANCELLED;
                }
                break;
            case COMPLETED:
            case CANCELLED:
                return false; // No transitions allowed from these final states
        }
        return false;
    }

    // Helper method to convert Booking to BookingResponse
    private BookingResponse convertToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        
        response.setId(booking.getId());
        response.setScheduledDateTime(booking.getScheduledDateTime());
        response.setEstimatedEndDateTime(booking.getEstimatedEndDateTime());
        response.setActualStartDateTime(booking.getActualStartDateTime());
        response.setActualEndDateTime(booking.getActualEndDateTime());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setNotes(booking.getNotes());
        response.setCustomerAddress(booking.getCustomerAddress());
        response.setCustomerLatitude(booking.getCustomerLatitude());
        response.setCustomerLongitude(booking.getCustomerLongitude());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCancelledBy(booking.getCancelledBy());
        response.setCancellationDateTime(booking.getCancellationDateTime());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());

        // Customer info
        User customer = booking.getCustomer();
        BookingResponse.CustomerInfo customerInfo = new BookingResponse.CustomerInfo(
                customer.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber()
        );
        response.setCustomer(customerInfo);

        // Service provider info
        ServiceProvider provider = booking.getServiceProvider();
        User providerUser = provider.getUser();
        BookingResponse.ServiceProviderInfo providerInfo = new BookingResponse.ServiceProviderInfo(
                provider.getId(),
                provider.getBusinessName(),
                providerUser.getFirstName() + " " + providerUser.getLastName(),
                providerUser.getEmail(),
                providerUser.getPhoneNumber(),
                provider.getAverageRating() != null ? Double.valueOf(provider.getAverageRating().doubleValue()) : 0.0
        );
        response.setServiceProvider(providerInfo);

        // Service info
        Service service = booking.getService();
        BookingResponse.ServiceInfo serviceInfo = new BookingResponse.ServiceInfo(
                service.getId(),
                service.getName(),
                service.getCategory(),
                service.getSubcategory(),
                service.getPrice(),
                service.getDurationMinutes()
        );
        response.setService(serviceInfo);

        return response;
    }
} 