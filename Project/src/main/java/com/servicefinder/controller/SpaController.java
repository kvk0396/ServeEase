package com.servicefinder.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;

@Controller
public class SpaController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<byte[]> root() throws IOException {
        ClassPathResource indexHtml = new ClassPathResource("static/index.html");
        return ResponseEntity
                .ok()
                .contentType(MediaType.TEXT_HTML)
                .body(indexHtml.getContentAsByteArray());
    }
} 