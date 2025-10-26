package com.servicefinder.controller;

import com.servicefinder.dto.ChatRequest;
import com.servicefinder.dto.ChatResponse;
import com.servicefinder.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
@Tag(name = "Chat", description = "AI-powered customer support chat")
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    @Autowired
    private ChatService chatService;
    
    @PostMapping("/send")
    @Operation(summary = "Send a message to the AI support assistant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Chat response generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request format"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        try {
            logger.info("Received chat request: {}", request.getMessage());
            
            String response = chatService.getChatResponse(request.getMessage());
            ChatResponse chatResponse = new ChatResponse(response);
            
            logger.info("Generated chat response successfully");
            return ResponseEntity.ok(chatResponse);
            
        } catch (Exception e) {
            logger.error("Error processing chat request: ", e);
            logger.info(e.getMessage());
            ChatResponse errorResponse = ChatResponse.error("Sorry, I'm having trouble processing your request right now. Please try again later.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Check chat service health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }
} 