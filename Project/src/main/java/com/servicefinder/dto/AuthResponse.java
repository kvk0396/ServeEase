package com.servicefinder.dto;

import com.servicefinder.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User login response")
public class AuthResponse {
    
    @Schema(description = "JWT authentication token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Token type", example = "Bearer")
    private String type = "Bearer";
    
    @Schema(description = "User email address", example = "admin@servicefinder.com")
    private String email;
    
    @Schema(description = "User role", example = "ADMIN")
    private Role role;
    
    @Schema(description = "User ID", example = "1")
    private Long userId;
    
    @Schema(description = "User full name", example = "Admin User")
    private String fullName;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, String email, Role role, Long userId, String fullName) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.fullName = fullName;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
} 