package com.servicefinder.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

 
public class ChatRequest {
	
	@NotBlank(message= " Message cannot be empty")
	@Size(max=1000 , message = "Message cannot exceed 1000 characters")
	private String message;

	public ChatRequest() {}
	public ChatRequest(
			@NotBlank(message = " Message cannot be empty") @Size(max = 1000, message = "Message cannot exceed 1000 characters") String message) {
		super();
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
    
}
