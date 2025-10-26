package com.servicefinder;

import com.servicefinder.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ServiceFinderApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        // Test that the Spring context loads successfully
        assertThat(userRepository).isNotNull();
    }

    @Test
    void databaseInitializationTest() {
        // Test that the database is initialized with test data
        long userCount = userRepository.count();
        assertThat(userCount).isGreaterThan(0);
        
        // Test that admin user exists
        boolean adminExists = userRepository.existsByEmail("admin@servicefinder.com");
        assertThat(adminExists).isTrue();
    }
} 