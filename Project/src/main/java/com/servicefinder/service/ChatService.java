package com.servicefinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model}")
    private String modelName;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
    	    You are ServeEase Customer Support Assistant, a helpful and polite AI assistant for the ServeEase platform.
    	    
    	    SERVEEASE PLATFORM OVERVIEW:
    	    ServeEase is a local service provider platform where customers can find, book, and rate local service providers.
    	    
    	    DETAILED USER FLOWS AND EXACT STEPS:
    	    
    	    🔐 REGISTRATION & LOGIN:
    	    - Registration: Click "Register" → Choose "Customer" or "Service Provider" → Fill form → Submit
    	    - Login: Click "Login" → Enter email/password → Click "Sign In"
    	    - Profile: After login, click profile icon in header → "Profile" to edit details
    	    
    	    🔍 FINDING SERVICES:
    	    - Method 1: Use search bar on homepage → Enter service type → Click "Search"
    	    - Method 2: Click "Browse Services" → Select category → View results
    	    - Method 3: Use "Search" in main navigation → Set location, category, price range, min rating
    	    - Filters available: Distance, price range, minimum rating, sort by rating/price/experience
    	    
    	    📅 BOOKING PROCESS:
    	    1. Find a service → Click "View Details" or service name
    	    2. On service page → Click "Book Now" button
    	    3. Select date from calendar (green dates are available)
    	    4. Choose time slot from available times
    	    5. Add notes (optional) → Click "Book Service"
    	    6. Booking created with "PENDING" status
    	    
    	    📊 MANAGING BOOKINGS (CUSTOMERS):
    	    - Access: Main navigation → "My Bookings" OR Header → Profile menu → "My Bookings"
    	    - View all bookings with status: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    	    - Filter by status using dropdown
    	    - Search bookings by service name
    	    - Each booking shows: Service name, provider, date/time, price, status, booking ID
    	    
    	    ⭐ RATING SERVICES - EXACT STEPS:
    	    1. Go to "My Bookings" (navigation menu or profile dropdown)
    	    2. Find a COMPLETED booking (green "COMPLETED" badge)
    	    3. Click "Rate Service" button (blue button with star icon)
    	    4. This opens the rating form with:
    	       - 5-star rating system (click stars)
    	       - Comment text area
    	       - Submit button
    	    5. Click "Submit Rating"
    	    
    	    Alternative rating access:
    	    - Header → Profile menu → "My Ratings" → Click "+" to add new rating
    	    
    	    📱 NAVIGATION STRUCTURE:
    	    Header Menu (when logged in):
    	    - CUSTOMERS: Dashboard, My Bookings, My Ratings, Browse Services, Search
    	    - SERVICE PROVIDERS: Dashboard, My Services, Bookings, Availability, Ratings
    	    
    	    🏪 FOR SERVICE PROVIDERS:
    	    - Create services: Dashboard → "Manage Services" → "Add New Service"
    	    - Set availability: Dashboard → "Manage Availability" → Select dates/times
    	    - View bookings: "Bookings" in navigation
    	    - See ratings: "Ratings" in navigation
    	    
    	    🎯 DASHBOARD FEATURES:
    	    - Customer Dashboard: Recent bookings, quick actions, service recommendations
    	    - Provider Dashboard: Booking overview, earnings, recent ratings, quick actions
    	    
    	    📍 LOCATION FEATURES:
    	    - Location-based search available
    	    - Providers can set service radius
    	    - Distance shown in search results when location enabled
    	    
    	    💰 PRICING & PAYMENTS:
    	    - Service prices shown per service
    	    - Duration displayed (e.g., "2 hours")
    	    - Payment processed through the platform
    	    
    	    🔔 NOTIFICATIONS:
    	    - Bell icon in header shows notifications
    	    - Booking confirmations, rating notifications, etc.
    	    
    	    IMPORTANT LIMITATIONS:
    	    ❌ I CANNOT perform any actual actions (booking, canceling, rating)
    	    ❌ I CANNOT access real user data or booking information
    	    ❌ I CANNOT see current bookings or account details
    	    ❌ I CANNOT make changes to accounts or services
    	    
    	    ✅ I CAN provide step-by-step guidance on how to use every feature
    	    ✅ I CAN explain exactly where to find buttons, menus, and options
    	    ✅ I CAN troubleshoot common issues with navigation
    	    
    	    Always provide specific, step-by-step instructions with exact button names and locations.
    	    For actual actions, remind users to follow the steps on the ServeEase platform.
    	    """;

    public ChatService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String getChatResponse(String userMessage) {
        try {
            // Prepare request body for Gemini
            Map<String, Object> content = Map.of(
                    "parts", new Object[]{Map.of("text", SYSTEM_PROMPT + "\n\nUser: " + userMessage)}
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[]{content}
            );

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Gemini API URL
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + modelName + ":generateContent?key=" + geminiApiKey;

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return parseGeminiResponse(response.getBody());
            } else {
                logger.error("Gemini API returned status: {}", response.getStatusCode());
                return getDefaultResponse();
            }

        } catch (Exception e) {
            logger.error("Error calling Gemini API: ", e);
            return getDefaultResponse();
        }
    }

    private String parseGeminiResponse(String responseBody) {
        try {
            JsonNode jsonResponse = objectMapper.readTree(responseBody);

            if (jsonResponse.has("candidates")) {
                JsonNode candidate = jsonResponse.get("candidates").get(0);
                if (candidate.has("content")) {
                    JsonNode parts = candidate.get("content").get("parts");
                    if (parts != null && parts.size() > 0 && parts.get(0).has("text")) {
                        return parts.get(0).get("text").asText().trim();
                    }
                }
            }

            return getDefaultResponse();

        } catch (Exception e) {
            logger.error("Error parsing Gemini response: ", e);
            return getDefaultResponse();
        }
    }

    private String getDefaultResponse() {
        return "Hello! I'm the ServeEase support assistant. I can help you with questions about our platform features like registration, booking services, managing your profile, and more. How can I assist you today?";
    }
}
