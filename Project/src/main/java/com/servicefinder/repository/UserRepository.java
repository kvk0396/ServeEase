package com.servicefinder.repository;

import com.servicefinder.model.User;
import com.servicefinder.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
    
    List<User> findByActiveTrue();
    
    @Query("SELECT u FROM User u WHERE u.city = :city AND u.active = true")
    List<User> findActiveUsersByCity(@Param("city") String city);
    
    @Query("SELECT u FROM User u WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL")
    List<User> findUsersWithLocation();
    
    @Query("SELECT u FROM User u WHERE " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(u.latitude)))) <= :radiusKm " +
           "AND u.active = true")
    List<User> findUsersWithinRadius(@Param("latitude") Double latitude, 
                                   @Param("longitude") Double longitude, 
                                   @Param("radiusKm") Double radiusKm);
} 