package com.servicefinder.controller;

import com.servicefinder.dto.AuthRequest;
import com.servicefinder.dto.AuthResponse;
import com.servicefinder.dto.UserRegisterRequest;
import com.servicefinder.dto.UserProfileUpdateRequest;
import com.servicefinder.model.User;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.enums.Role;
import com.servicefinder.model.enums.VerificationStatus;
import com.servicefinder.repository.UserRepository;
import com.servicefinder.repository.ServiceProviderRepository;
import com.servicefinder.security.JwtUtil;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Operation(
        summary = "User registration",
        description = "Register a new user as customer or service provider"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", 
                    description = "Registration successful",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = RegistrationResponse.class))),
        @ApiResponse(responseCode = "400", 
                    description = "Invalid registration data or email already exists",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Parameter(description = "User registration data", required = true)
            @Valid @RequestBody UserRegisterRequest registerRequest) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Registration failed", "Email already exists"));
            }

            // Create new user
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setPhoneNumber(registerRequest.getPhoneNumber());
            user.setAddress(registerRequest.getAddress());
            user.setCity(registerRequest.getCity());
            user.setState(registerRequest.getState());
            user.setPostalCode(registerRequest.getZipCode());
            user.setCountry(registerRequest.getCountry());
            user.setActive(true);

            // Set role
            Role role = "SERVICE_PROVIDER".equals(registerRequest.getUserType()) ? 
                       Role.SERVICE_PROVIDER : Role.CUSTOMER;
            user.setRole(role);

            // Save user
            User savedUser = userRepository.save(user);

            // If service provider, create ServiceProvider entity
            if (role == Role.SERVICE_PROVIDER) {
                ServiceProvider serviceProvider = new ServiceProvider();
                serviceProvider.setUser(savedUser);
                serviceProvider.setBusinessName(registerRequest.getBusinessName());
                serviceProvider.setDescription(""); // Default empty description
                serviceProvider.setAvailable(true);
                serviceProvider.setVerificationStatus(VerificationStatus.PENDING);
                serviceProvider.setYearsOfExperience(0); // Default
                
                // Save the service provider
                ServiceProvider savedServiceProvider = serviceProviderRepository.save(serviceProvider);
                
                // Set the bidirectional relationship
                savedUser.setServiceProvider(savedServiceProvider);
                userRepository.save(savedUser);
            }

            // Return success response without token
            RegistrationResponse registrationResponse = new RegistrationResponse(
                "Registration successful", 
                savedUser.getEmail(), 
                savedUser.getRole(),
                savedUser.getId(),
                savedUser.getFullName()
            );

            return ResponseEntity.status(201).body(registrationResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Registration failed", e.getMessage()));
        }
    }

    @Operation(
        summary = "User login",
        description = "Authenticate user with email and password to receive JWT token"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", 
                    description = "Login successful",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", 
                    description = "Invalid credentials",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Parameter(description = "User login credentials", required = true)
            @Valid @RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
            String token = jwtUtil.generateToken(userDetails);

            // Get user information for response
            User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse authResponse = new AuthResponse(
                token, 
                user.getEmail(), 
                user.getRole(),
                user.getId(),
                user.getFullName()
            );

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Invalid credentials", e.getMessage()));
        }
    }

    @Operation(
        summary = "Get user profile",
        description = "Get complete user profile information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // If user is a service provider, include provider-specific data
            if (user.getRole() == Role.SERVICE_PROVIDER) {
                ServiceProvider provider = serviceProviderRepository.findByUserId(user.getId())
                    .orElse(null);
                
                // Create a combined response with both user and provider data
                Map<String, Object> profileData = new HashMap<>();
                profileData.put("id", user.getId());
                profileData.put("firstName", user.getFirstName());
                profileData.put("lastName", user.getLastName());
                profileData.put("fullName", user.getFullName());
                profileData.put("email", user.getEmail());
                profileData.put("phoneNumber", user.getPhoneNumber());
                profileData.put("address", user.getAddress());
                profileData.put("city", user.getCity());
                profileData.put("state", user.getState());
                profileData.put("postalCode", user.getPostalCode());
                profileData.put("country", user.getCountry());
                profileData.put("role", user.getRole().name());
                
                if (provider != null) {
                    profileData.put("businessName", provider.getBusinessName());
                    profileData.put("description", provider.getDescription());
                    profileData.put("yearsOfExperience", provider.getYearsOfExperience());
                    profileData.put("hourlyRate", provider.getHourlyRate());
                    profileData.put("workingHours", provider.getWorkingHours());
                    profileData.put("serviceRadiusKm", provider.getServiceRadiusKm());
                    profileData.put("verificationStatus", provider.getVerificationStatus().name());
                    profileData.put("averageRating", provider.getAverageRating());
                    profileData.put("totalRatings", provider.getTotalRatings());
                }
                
                return ResponseEntity.ok(profileData);
            } else {
                return ResponseEntity.ok(user);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to get profile", e.getMessage()));
        }
    }

    @Operation(
        summary = "Update user profile",
        description = "Update user profile information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> updateUserProfile(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Update user fields
            if (request.containsKey("firstName")) user.setFirstName((String) request.get("firstName"));
            if (request.containsKey("lastName")) user.setLastName((String) request.get("lastName"));
            if (request.containsKey("phoneNumber")) user.setPhoneNumber((String) request.get("phoneNumber"));
            if (request.containsKey("address")) user.setAddress((String) request.get("address"));
            if (request.containsKey("city")) user.setCity((String) request.get("city"));
            if (request.containsKey("state")) user.setState((String) request.get("state"));
            if (request.containsKey("postalCode")) user.setPostalCode((String) request.get("postalCode"));
            if (request.containsKey("country")) user.setCountry((String) request.get("country"));

            User updatedUser = userRepository.save(user);

            // If user is a service provider, update provider-specific fields
            if (user.getRole() == Role.SERVICE_PROVIDER) {
                ServiceProvider provider = serviceProviderRepository.findByUserId(user.getId())
                    .orElse(null);
                    
                if (provider != null) {
                    if (request.containsKey("businessName")) provider.setBusinessName((String) request.get("businessName"));
                    if (request.containsKey("description")) provider.setDescription((String) request.get("description"));
                    if (request.containsKey("yearsOfExperience")) provider.setYearsOfExperience((Integer) request.get("yearsOfExperience"));
                    if (request.containsKey("workingHours")) provider.setWorkingHours((String) request.get("workingHours"));
                    if (request.containsKey("serviceRadiusKm")) provider.setServiceRadiusKm((Integer) request.get("serviceRadiusKm"));
                    
                    serviceProviderRepository.save(provider);
                }
                
                // Return combined profile data for providers
                return getUserProfile(authentication);
            } else {
                return ResponseEntity.ok(updatedUser);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to update profile", e.getMessage()));
        }
    }

    @Operation(
        summary = "Validate JWT token",
        description = "Validate the provided JWT token and return user information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", 
                    description = "Token is valid",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", 
                    description = "Invalid or expired token",
                    content = @Content(mediaType = "application/json",
                                     schema = @Schema(implementation = ErrorResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @Parameter(description = "JWT token with Bearer prefix", required = true)
            @RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getEmail(),
                    user.getRole(),
                    user.getId(),
                    user.getFullName()
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid token", "Token validation failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Token validation failed", e.getMessage()));
        }
    }

    // Inner class for registration responses
    public static class RegistrationResponse {
        private String message;
        private String email;
        private Role role;
        private Long userId;
        private String fullName;

        public RegistrationResponse(String message, String email, Role role, Long userId, String fullName) {
            this.message = message;
            this.email = email;
            this.role = role;
            this.userId = userId;
            this.fullName = fullName;
        }

        // Getters
        public String getMessage() {
            return message;
        }

        public String getEmail() {
            return email;
        }

        public Role getRole() {
            return role;
        }

        public Long getUserId() {
            return userId;
        }

        public String getFullName() {
            return fullName;
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

        // Getters
        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }
    }
} 