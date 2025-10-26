package com.servicefinder.dto;

import java.time.LocalDateTime;

public class ChatResponse {

    private String response;
    private LocalDateTime timestamp;
    private boolean success;
    private String error;

    // IMPORTANT: No-argument constructor for Jackson
    public ChatResponse() {
    }

    // This is the constructor for a SUCCESSFUL response.
    // We now set the success flag and timestamp automatically.
    public ChatResponse(String response) {
        this.response = response;
        this.success = true;
        this.timestamp = LocalDateTime.now();
    }

    // Full constructor (optional but good to have)
    public ChatResponse(String response, LocalDateTime timestamp, boolean success, String error) {
        this.response = response;
        this.timestamp = timestamp;
        this.success = success;
        this.error = error;
    }

    // Helper method to create error responses
    public static ChatResponse error(String errorMessage) {
        ChatResponse response = new ChatResponse();
        response.success = false;
        response.error = errorMessage;
        response.timestamp = LocalDateTime.now();
        return response;
    }

    // --- Getters and Setters ---

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}