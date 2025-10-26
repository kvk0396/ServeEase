package com.servicefinder.repository;

import com.servicefinder.model.Service;
import com.servicefinder.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByServiceProvider(ServiceProvider serviceProvider);
    
    List<Service> findByServiceProviderId(Long serviceProviderId);
    
    List<Service> findByActiveTrue();
    
    List<Service> findByCategory(String category);
    
    List<Service> findByCategoryAndActiveTrue(String category);
    
    List<Service> findBySubcategory(String subcategory);
    
    List<Service> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT s FROM Service s WHERE s.active = true AND s.name LIKE %:keyword% OR s.description LIKE %:keyword%")
    List<Service> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT s FROM Service s WHERE s.active = true AND s.price BETWEEN :minPrice AND :maxPrice")
    List<Service> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT s FROM Service s WHERE s.active = true AND s.category = :category AND s.price BETWEEN :minPrice AND :maxPrice")
    List<Service> findByCategoryAndPriceRange(@Param("category") String category, 
                                            @Param("minPrice") BigDecimal minPrice, 
                                            @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT DISTINCT s.category FROM Service s WHERE s.active = true ORDER BY s.category")
    List<String> findAllCategories();
    
    @Query("SELECT DISTINCT s.subcategory FROM Service s WHERE s.active = true AND s.category = :category ORDER BY s.subcategory")
    List<String> findSubcategoriesByCategory(@Param("category") String category);
    
    @Query("SELECT s FROM Service s JOIN s.serviceProvider sp JOIN sp.user u WHERE " +
           "s.active = true AND sp.available = true AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(u.latitude)) * " +
           "cos(radians(u.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(u.latitude)))) <= :radiusKm")
    List<Service> findServicesWithinRadius(@Param("latitude") Double latitude, 
                                         @Param("longitude") Double longitude, 
                                         @Param("radiusKm") Double radiusKm);
} 