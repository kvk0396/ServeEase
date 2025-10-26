package com.servicefinder.controller;

import com.servicefinder.dto.ServiceCreateRequest;
import com.servicefinder.dto.ServiceResponse;
import com.servicefinder.dto.ServiceUpdateRequest;
import com.servicefinder.model.Service;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.User;
import com.servicefinder.repository.ServiceRepository;
import com.servicefinder.repository.ServiceProviderRepository;
import com.servicefinder.repository.UserRepository;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/services")
@CrossOrigin(origins = "*")
@Tag(name = "Service Management", description = "CRUD operations for services")
@SecurityRequirement(name = "bearerAuth")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    @Autowired
    private UserRepository userRepository;

    @Operation(
        summary = "Create a new service",
        description = "Service providers can create new services they offer"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Service created successfully",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ServiceResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    @PostMapping
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> createService(
            @Parameter(description = "Service creation data", required = true)
            @Valid @RequestBody ServiceCreateRequest request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            ServiceProvider serviceProvider = serviceProviderRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Service provider profile not found"));

            Service service = new Service();
            service.setServiceProvider(serviceProvider);
            service.setName(request.getName());
            service.setDescription(request.getDescription());
            service.setCategory(request.getCategory());
            service.setSubcategory(request.getSubcategory());
            service.setPrice(request.getPrice());
            service.setDurationMinutes(request.getDurationMinutes());
            service.setActive(true);
            service.setServiceArea(request.getServiceArea());

            // Map detailed location fields
            service.setLocationCity(request.getCity());
            service.setLocationDistrict(request.getDistrict());
            service.setLocationState(request.getState());
            service.setLocationCountry(request.getCountry());
            service.setLocationPostalCode(request.getPostalCode());
            service.setLocationLatitude(request.getLatitude());
            service.setLocationLongitude(request.getLongitude());
            service.setServiceRadiusKm(request.getServiceRadiusKm());

            Service savedService = serviceRepository.save(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ServiceResponse(savedService));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Service creation failed", e.getMessage()));
        }
    }

    @Operation(
        summary = "Get all active services",
        description = "Retrieve all active services with optional filtering"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Services retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices(
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by subcategory") @RequestParam(required = false) String subcategory,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String search,
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice) {
        
        List<Service> services;

        if (search != null && !search.trim().isEmpty()) {
            services = serviceRepository.searchByKeyword(search.trim());
        } else if (category != null && minPrice != null && maxPrice != null) {
            services = serviceRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice);
        } else if (minPrice != null && maxPrice != null) {
            services = serviceRepository.findByPriceRange(minPrice, maxPrice);
        } else if (category != null) {
            services = serviceRepository.findByCategoryAndActiveTrue(category);
        } else if (subcategory != null) {
            services = serviceRepository.findBySubcategory(subcategory);
        } else {
            services = serviceRepository.findByActiveTrue();
        }

        List<ServiceResponse> serviceResponses = services.stream()
            .map(ServiceResponse::new)
            .collect(Collectors.toList());

        return ResponseEntity.ok(serviceResponses);
    }

    @Operation(
        summary = "Get service by ID",
        description = "Retrieve a specific service by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service found",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ServiceResponse.class))),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceById(
            @Parameter(description = "Service ID", required = true) @PathVariable Long serviceId) {
        
        Optional<Service> serviceOpt = serviceRepository.findById(serviceId);
        if (serviceOpt.isPresent()) {
            return ResponseEntity.ok(new ServiceResponse(serviceOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Get services by provider",
        description = "Retrieve all services offered by a specific service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Services retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service provider not found")
    })
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getServicesByProvider(
            @Parameter(description = "Service provider ID", required = true) @PathVariable Long providerId) {
        
        Optional<ServiceProvider> providerOpt = serviceProviderRepository.findById(providerId);
        if (providerOpt.isPresent()) {
            List<Service> services = serviceRepository.findByServiceProvider(providerOpt.get());
            List<ServiceResponse> serviceResponses = services.stream()
                .map(ServiceResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(serviceResponses);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Get my services",
        description = "Service providers can retrieve their own services"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Services retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Service provider profile not found")
    })
    @GetMapping("/my-services")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyServices(Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            ServiceProvider serviceProvider = serviceProviderRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Service provider profile not found"));

            List<Service> services = serviceRepository.findByServiceProvider(serviceProvider);
            List<ServiceResponse> serviceResponses = services.stream()
                .map(ServiceResponse::new)
                .collect(Collectors.toList());

            return ResponseEntity.ok(serviceResponses);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to retrieve services", e.getMessage()));
        }
    }

    @Operation(
        summary = "Update service",
        description = "Service providers can update their existing services"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service updated successfully",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ServiceResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "403", description = "Access denied - not your service"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    @PutMapping("/{serviceId}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateService(
            @Parameter(description = "Service ID", required = true) @PathVariable Long serviceId,
            @Parameter(description = "Service update data", required = true)
            @Valid @RequestBody ServiceUpdateRequest request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Service> serviceOpt = serviceRepository.findById(serviceId);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOpt.get();

            // Check if user owns this service (unless admin)
            if (!user.isAdmin() && !service.getServiceProvider().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied", "You can only update your own services"));
            }

            // Update only provided fields
            if (request.getName() != null) {
                service.setName(request.getName());
            }
            if (request.getDescription() != null) {
                service.setDescription(request.getDescription());
            }
            if (request.getCategory() != null) {
                service.setCategory(request.getCategory());
            }
            if (request.getSubcategory() != null) {
                service.setSubcategory(request.getSubcategory());
            }
            if (request.getPrice() != null) {
                service.setPrice(request.getPrice());
            }
            if (request.getDurationMinutes() != null) {
                service.setDurationMinutes(request.getDurationMinutes());
            }
            if (request.getActive() != null) {
                service.setActive(request.getActive());
            }
            if (request.getServiceArea() != null) {
                service.setServiceArea(request.getServiceArea());
            }
            if (request.getCity() != null) service.setLocationCity(request.getCity());
            if (request.getDistrict() != null) service.setLocationDistrict(request.getDistrict());
            if (request.getState() != null) service.setLocationState(request.getState());
            if (request.getCountry() != null) service.setLocationCountry(request.getCountry());
            if (request.getPostalCode() != null) service.setLocationPostalCode(request.getPostalCode());
            if (request.getLatitude() != null) service.setLocationLatitude(request.getLatitude());
            if (request.getLongitude() != null) service.setLocationLongitude(request.getLongitude());
            if (request.getServiceRadiusKm() != null) service.setServiceRadiusKm(request.getServiceRadiusKm());

            Service updatedService = serviceRepository.save(service);
            return ResponseEntity.ok(new ServiceResponse(updatedService));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Service update failed", e.getMessage()));
        }
    }

    @Operation(
        summary = "Delete service",
        description = "Service providers can delete their existing services"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Service deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied - not your service"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    @DeleteMapping("/{serviceId}")
    @PreAuthorize("hasRole('SERVICE_PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteService(
            @Parameter(description = "Service ID", required = true) @PathVariable Long serviceId,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Service> serviceOpt = serviceRepository.findById(serviceId);
            if (!serviceOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOpt.get();

            // Check if user owns this service (unless admin)
            if (!user.isAdmin() && !service.getServiceProvider().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied", "You can only delete your own services"));
            }

            serviceRepository.delete(service);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Service deletion failed", e.getMessage()));
        }
    }

    @Operation(
        summary = "Get service categories",
        description = "Retrieve all available service categories"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = serviceRepository.findAllCategories();
        return ResponseEntity.ok(categories);
    }

    @Operation(
        summary = "Get subcategories by category",
        description = "Retrieve subcategories for a specific category"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Subcategories retrieved successfully")
    })
    @GetMapping("/subcategories")
    public ResponseEntity<List<String>> getSubcategories(
            @Parameter(description = "Category name", required = true) @RequestParam String category) {
        List<String> subcategories = serviceRepository.findSubcategoriesByCategory(category);
        return ResponseEntity.ok(subcategories);
    }

    @Operation(
        summary = "Search services by location",
        description = "Find services within a specified radius of given coordinates"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Services retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid location parameters")
    })
    @GetMapping("/search/location")
    public ResponseEntity<?> searchServicesByLocation(
            @Parameter(description = "Latitude", required = true) @RequestParam Double latitude,
            @Parameter(description = "Longitude", required = true) @RequestParam Double longitude,
            @Parameter(description = "Search radius in kilometers", required = false) @RequestParam(defaultValue = "25") Double radiusKm) {
        
        try {
            List<Service> services = serviceRepository.findServicesWithinRadius(latitude, longitude, radiusKm);
            List<ServiceResponse> serviceResponses = services.stream()
                .map(ServiceResponse::new)
                .collect(Collectors.toList());

            return ResponseEntity.ok(serviceResponses);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Location search failed", e.getMessage()));
        }
    }

    // Inner class for error responses
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }
    }
} 