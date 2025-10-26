package com.servicefinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ServeEaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServeEaseApplication.class, args);
    }
} 