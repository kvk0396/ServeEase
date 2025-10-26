package com.servicefinder.config;

import com.servicefinder.model.User;
import com.servicefinder.model.ServiceProvider;
import com.servicefinder.model.Service;
import com.servicefinder.model.Booking;
import com.servicefinder.model.Rating;
import com.servicefinder.model.Availability;
import com.servicefinder.model.enums.Role;
import com.servicefinder.model.enums.VerificationStatus;
import com.servicefinder.model.enums.BookingStatus;
import com.servicefinder.repository.UserRepository;
import com.servicefinder.repository.ServiceProviderRepository;
import com.servicefinder.repository.ServiceRepository;
import com.servicefinder.repository.BookingRepository;
import com.servicefinder.repository.RatingRepository;
import com.servicefinder.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Profile({"dev","test"})
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceProviderRepository serviceProviderRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            initializeUsers();
            initializeServiceProviders();
            initializeServices();
            initializeBookings();
            initializeAvailabilities();
            // TODO: Fix initializeRatings() - temporarily disabled to get geolocation working
            // initializeRatings();
        }
        
        System.out.println("Data initialization complete!");
    }

    private void initializeUsers() {
        // Create admin user
        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail("admin@servicefinder.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setPhoneNumber("+1234567890");
        admin.setCity("Admin City");
        admin.setState("Admin State");
        admin.setCountry("Admin Country");
        userRepository.save(admin);

        // Create customer user - Mumbai, India
        User customer = new User();
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("customer@test.com");
        customer.setPassword(passwordEncoder.encode("customer123"));
        customer.setRole(Role.CUSTOMER);
        customer.setActive(true);
        customer.setPhoneNumber("+919876543210");
        customer.setAddress("123 Marine Drive");
        customer.setCity("Mumbai");
        customer.setState("Maharashtra");
        customer.setCountry("India");
        customer.setLatitude(19.0760); // Mumbai coordinates
        customer.setLongitude(72.8777);
        userRepository.save(customer);

        // Create service provider user 1 - Mumbai, India (Close to customer)
        User provider1 = new User();
        provider1.setFirstName("Jane");
        provider1.setLastName("Smith");
        provider1.setEmail("provider@test.com");
        provider1.setPassword(passwordEncoder.encode("provider123"));
        provider1.setRole(Role.SERVICE_PROVIDER);
        provider1.setActive(true);
        provider1.setPhoneNumber("+919876543211");
        provider1.setAddress("456 Bandra West");
        provider1.setCity("Mumbai");
        provider1.setState("Maharashtra");
        provider1.setCountry("India");
        provider1.setLatitude(19.0596); // Bandra, Mumbai - ~3km from Marine Drive
        provider1.setLongitude(72.8295);
        userRepository.save(provider1);

        // Create service provider user 2 - Mumbai, India (Medium distance)
        User provider2 = new User();
        provider2.setFirstName("Raj");
        provider2.setLastName("Patel");
        provider2.setEmail("raj.patel@services.com");
        provider2.setPassword(passwordEncoder.encode("provider123"));
        provider2.setRole(Role.SERVICE_PROVIDER);
        provider2.setActive(true);
        provider2.setPhoneNumber("+919876543212");
        provider2.setAddress("789 Andheri East");
        provider2.setCity("Mumbai");
        provider2.setState("Maharashtra");
        provider2.setCountry("India");
        provider2.setLatitude(19.1136); // Andheri East - ~8km from Marine Drive
        provider2.setLongitude(72.8697);
        userRepository.save(provider2);

        // Create service provider user 3 - Pune, India (Far distance)
        User provider3 = new User();
        provider3.setFirstName("Priya");
        provider3.setLastName("Sharma");
        provider3.setEmail("priya.sharma@services.com");
        provider3.setPassword(passwordEncoder.encode("provider123"));
        provider3.setRole(Role.SERVICE_PROVIDER);
        provider3.setActive(true);
        provider3.setPhoneNumber("+919876543213");
        provider3.setAddress("321 FC Road");
        provider3.setCity("Pune");
        provider3.setState("Maharashtra");
        provider3.setCountry("India");
        provider3.setLatitude(18.5204); // Pune - ~150km from Mumbai
        provider3.setLongitude(73.8567);
        userRepository.save(provider3);

        System.out.println("Test users created:");
        System.out.println("Admin: admin@servicefinder.com / admin123");
        System.out.println("Customer: customer@test.com / customer123 (Mumbai, Marine Drive)");
        System.out.println("Provider 1: provider@test.com / provider123 (Mumbai, Bandra - 3km)");
        System.out.println("Provider 2: raj.patel@services.com / provider123 (Mumbai, Andheri - 8km)");
        System.out.println("Provider 3: priya.sharma@services.com / provider123 (Pune - 150km)");
    }

    private void initializeServiceProviders() {
        // Create service provider profile 1 - Jane Smith (Close to customer)
        User providerUser1 = userRepository.findByEmail("provider@test.com").orElse(null);
        if (providerUser1 != null) {
            ServiceProvider serviceProvider1 = new ServiceProvider();
            serviceProvider1.setUser(providerUser1);
            serviceProvider1.setBusinessName("Smith's Professional Services");
            serviceProvider1.setDescription("Experienced provider offering various home and professional services with over 5 years of experience");
            serviceProvider1.setVerificationStatus(VerificationStatus.VERIFIED);
            serviceProvider1.setYearsOfExperience(5);
            serviceProvider1.setProfileVerified(true);
            serviceProvider1.setBackgroundChecked(true);
            serviceProvider1.setInsuranceVerified(true);
            serviceProvider1.setServiceRadiusKm(10); // 10km service radius
            serviceProvider1.setHourlyRate(new java.math.BigDecimal("75.00"));
            serviceProvider1.setWorkingHours("Monday-Friday: 8:00-18:00, Saturday: 9:00-15:00");
            serviceProvider1.setAvailable(true);
            serviceProviderRepository.save(serviceProvider1);
        }

        // Create service provider profile 2 - Raj Patel (Medium distance)
        User providerUser2 = userRepository.findByEmail("raj.patel@services.com").orElse(null);
        if (providerUser2 != null) {
            ServiceProvider serviceProvider2 = new ServiceProvider();
            serviceProvider2.setUser(providerUser2);
            serviceProvider2.setBusinessName("Patel Technical Solutions");
            serviceProvider2.setDescription("Specialized in electrical, plumbing, and computer services with 8 years of experience. Quick response and quality work guaranteed.");
            serviceProvider2.setVerificationStatus(VerificationStatus.VERIFIED);
            serviceProvider2.setYearsOfExperience(8);
            serviceProvider2.setProfileVerified(true);
            serviceProvider2.setBackgroundChecked(true);
            serviceProvider2.setInsuranceVerified(false);
            serviceProvider2.setServiceRadiusKm(15); // 15km service radius
            serviceProvider2.setHourlyRate(new java.math.BigDecimal("85.00"));
            serviceProvider2.setWorkingHours("Monday-Saturday: 9:00-19:00");
            serviceProvider2.setAvailable(true);
            serviceProviderRepository.save(serviceProvider2);
        }

        // Create service provider profile 3 - Priya Sharma (Far distance)
        User providerUser3 = userRepository.findByEmail("priya.sharma@services.com").orElse(null);
        if (providerUser3 != null) {
            ServiceProvider serviceProvider3 = new ServiceProvider();
            serviceProvider3.setUser(providerUser3);
            serviceProvider3.setBusinessName("Sharma Education & Consulting");
            serviceProvider3.setDescription("Premium tutoring and educational consulting services. Specialist in mathematics, science, and competitive exam preparation.");
            serviceProvider3.setVerificationStatus(VerificationStatus.VERIFIED);
            serviceProvider3.setYearsOfExperience(12);
            serviceProvider3.setProfileVerified(true);
            serviceProvider3.setBackgroundChecked(true);
            serviceProvider3.setInsuranceVerified(true);
            serviceProvider3.setServiceRadiusKm(25); // 25km service radius (longer for education)
            serviceProvider3.setHourlyRate(new java.math.BigDecimal("120.00"));
            serviceProvider3.setWorkingHours("Monday-Sunday: 14:00-22:00");
            serviceProvider3.setAvailable(true);
            serviceProviderRepository.save(serviceProvider3);
        }

        System.out.println("Service provider profiles created:");
        System.out.println("- Smith's Professional Services (Mumbai, Bandra) - 10km radius");
        System.out.println("- Patel Technical Solutions (Mumbai, Andheri) - 15km radius");  
        System.out.println("- Sharma Education & Consulting (Pune) - 25km radius");
    }

    private void initializeServices() {
        // Get all service providers
        ServiceProvider provider1 = serviceProviderRepository.findByUserId(
            userRepository.findByEmail("provider@test.com").get().getId()
        ).orElse(null);
        
        ServiceProvider provider2 = serviceProviderRepository.findByUserId(
            userRepository.findByEmail("raj.patel@services.com").get().getId()
        ).orElse(null);
        
        ServiceProvider provider3 = serviceProviderRepository.findByUserId(
            userRepository.findByEmail("priya.sharma@services.com").get().getId()
        ).orElse(null);

        // Services for Provider 1 (Smith's Professional Services)
        if (provider1 != null) {
            // Electrical Service
            Service electricalService = new Service();
            electricalService.setServiceProvider(provider1);
            electricalService.setName("Home Electrical Repair");
            electricalService.setDescription("Professional electrical repair and installation services for residential properties. Including wiring, outlet installation, lighting fixtures, and electrical troubleshooting.");
            electricalService.setCategory("Home Maintenance");
            electricalService.setSubcategory("Electrical");
            electricalService.setPrice(new java.math.BigDecimal("75.00"));
            electricalService.setDurationMinutes(120);
            electricalService.setActive(true);
            serviceRepository.save(electricalService);

            // Plumbing Service
            Service plumbingService = new Service();
            plumbingService.setServiceProvider(provider1);
            plumbingService.setName("Residential Plumbing Services");
            plumbingService.setDescription("Complete plumbing solutions including leak repairs, pipe installation, drain cleaning, and fixture replacement for homes and apartments.");
            plumbingService.setCategory("Home Maintenance");
            plumbingService.setSubcategory("Plumbing");
            plumbingService.setPrice(new java.math.BigDecimal("85.00"));
            plumbingService.setDurationMinutes(90);
            plumbingService.setActive(true);
            serviceRepository.save(plumbingService);
        }

        // Services for Provider 2 (Patel Technical Solutions)
        if (provider2 != null) {
            // Advanced Electrical Service
            Service advancedElectricalService = new Service();
            advancedElectricalService.setServiceProvider(provider2);
            advancedElectricalService.setName("Advanced Electrical Systems");
            advancedElectricalService.setDescription("Commercial and residential electrical work including panel upgrades, smart home installations, and industrial electrical systems.");
            advancedElectricalService.setCategory("Home Maintenance");
            advancedElectricalService.setSubcategory("Electrical");
            advancedElectricalService.setPrice(new java.math.BigDecimal("95.00"));
            advancedElectricalService.setDurationMinutes(150);
            advancedElectricalService.setActive(true);
            serviceRepository.save(advancedElectricalService);

            // Computer Repair Service
            Service computerService = new Service();
            computerService.setServiceProvider(provider2);
            computerService.setName("Computer Repair & Setup");
            computerService.setDescription("Professional computer repair, virus removal, software installation, and system optimization for both Windows and Mac computers.");
            computerService.setCategory("Technology");
            computerService.setSubcategory("Computer Services");
            computerService.setPrice(new java.math.BigDecimal("90.00"));
            computerService.setDurationMinutes(150);
            computerService.setActive(true);
            serviceRepository.save(computerService);

            // Home Cleaning Service
            Service cleaningService = new Service();
            cleaningService.setServiceProvider(provider2);
            cleaningService.setName("Professional House Cleaning");
            cleaningService.setDescription("Comprehensive house cleaning service including kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products available upon request.");
            cleaningService.setCategory("Home Services");
            cleaningService.setSubcategory("Cleaning");
            cleaningService.setPrice(new java.math.BigDecimal("110.00"));
            cleaningService.setDurationMinutes(180);
            cleaningService.setActive(true);
            serviceRepository.save(cleaningService);
        }

        // Services for Provider 3 (Sharma Education & Consulting)
        if (provider3 != null) {
            // Math Tutoring Service
            Service mathTutoringService = new Service();
            mathTutoringService.setServiceProvider(provider3);
            mathTutoringService.setName("Advanced Mathematics Tutoring");
            mathTutoringService.setDescription("Specialized tutoring in advanced mathematics including calculus, algebra, geometry, and statistics for high school and college students.");
            mathTutoringService.setCategory("Education");
            mathTutoringService.setSubcategory("Academic Tutoring");
            mathTutoringService.setPrice(new java.math.BigDecimal("80.00"));
            mathTutoringService.setDurationMinutes(60);
            mathTutoringService.setActive(true);
            serviceRepository.save(mathTutoringService);

            // Science Tutoring Service
            Service scienceTutoringService = new Service();
            scienceTutoringService.setServiceProvider(provider3);
            scienceTutoringService.setName("Science & Physics Tutoring");
            scienceTutoringService.setDescription("Comprehensive science tutoring covering physics, chemistry, and biology with hands-on experiments and practical applications.");
            scienceTutoringService.setCategory("Education");
            scienceTutoringService.setSubcategory("Academic Tutoring");
            scienceTutoringService.setPrice(new java.math.BigDecimal("85.00"));
            scienceTutoringService.setDurationMinutes(75);
            scienceTutoringService.setActive(true);
            serviceRepository.save(scienceTutoringService);

            // Competitive Exam Coaching
            Service examCoachingService = new Service();
            examCoachingService.setServiceProvider(provider3);
            examCoachingService.setName("Competitive Exam Coaching");
            examCoachingService.setDescription("Specialized coaching for competitive exams like JEE, NEET, SAT, and GRE with proven strategies and comprehensive study materials.");
            examCoachingService.setCategory("Education");
            examCoachingService.setSubcategory("Test Preparation");
            examCoachingService.setPrice(new java.math.BigDecimal("120.00"));
            examCoachingService.setDurationMinutes(90);
            examCoachingService.setActive(true);
            serviceRepository.save(examCoachingService);
        }

        System.out.println("Sample services created:");
        System.out.println("Provider 1 (Smith's): Electrical ($75), Plumbing ($85)");
        System.out.println("Provider 2 (Patel's): Advanced Electrical ($95), Computer Repair ($90), Cleaning ($110)");
        System.out.println("Provider 3 (Sharma's): Math Tutoring ($80), Science Tutoring ($85), Exam Coaching ($120)");
    }

    private void initializeBookings() {
        if (bookingRepository.count() == 0) {
            // Get the users and service providers we created
            User customer = userRepository.findByEmail("customer@test.com").orElse(null);
            User admin = userRepository.findByEmail("admin@serveease.com").orElse(null);
            
            ServiceProvider provider1 = serviceProviderRepository.findByUser(
                userRepository.findByEmail("provider@test.com").orElse(null)
            ).orElse(null);
            
            ServiceProvider provider2 = serviceProviderRepository.findByUser(
                userRepository.findByEmail("raj.patel@services.com").orElse(null)
            ).orElse(null);
            
            ServiceProvider provider3 = serviceProviderRepository.findByUser(
                userRepository.findByEmail("priya.sharma@services.com").orElse(null)
            ).orElse(null);
            
            if (customer == null || provider1 == null || provider2 == null || provider3 == null) {
                System.out.println("Could not find required users for booking initialization");
                return;
            }

            // Get services for each provider
            List<Service> provider1Services = serviceRepository.findByServiceProvider(provider1);
            List<Service> provider2Services = serviceRepository.findByServiceProvider(provider2);
            List<Service> provider3Services = serviceRepository.findByServiceProvider(provider3);

            // Create sample bookings with different statuses
            LocalDateTime now = LocalDateTime.now();

            // Booking 1: Confirmed electrical repair for tomorrow (Provider 1 - Close distance)
            Service electricalService = provider1Services.stream()
                .filter(s -> s.getName().contains("Electrical"))
                .findFirst().orElse(provider1Services.get(0));
            
            Booking booking1 = new Booking();
            booking1.setCustomer(customer);
            booking1.setServiceProvider(provider1);
            booking1.setService(electricalService);
            booking1.setScheduledDateTime(now.plusDays(1).withHour(10).withMinute(0));
            booking1.setEstimatedEndDateTime(now.plusDays(1).withHour(12).withMinute(0));
            booking1.setStatus(BookingStatus.CONFIRMED);
            booking1.setTotalPrice(electricalService.getPrice());
            booking1.setNotes("Need to fix electrical outlet in kitchen");
            booking1.setCustomerAddress("123 Marine Drive, Mumbai, Maharashtra 400001");
            booking1.setCustomerLatitude(19.0760);  // Customer location
            booking1.setCustomerLongitude(72.8777);
            bookingRepository.save(booking1);

            // Booking 2: Completed plumbing service from yesterday (Provider 1 - Close distance)
            Service plumbingService = provider1Services.stream()
                .filter(s -> s.getName().contains("Plumbing"))
                .findFirst().orElse(provider1Services.get(0));
            
            Booking booking2 = new Booking();
            booking2.setCustomer(customer);
            booking2.setServiceProvider(provider1);
            booking2.setService(plumbingService);
            booking2.setScheduledDateTime(now.minusDays(1).withHour(14).withMinute(0));
            booking2.setEstimatedEndDateTime(now.minusDays(1).withHour(15).withMinute(30));
            booking2.setActualStartDateTime(now.minusDays(1).withHour(14).withMinute(15));
            booking2.setActualEndDateTime(now.minusDays(1).withHour(15).withMinute(45));
            booking2.setStatus(BookingStatus.COMPLETED);
            booking2.setTotalPrice(plumbingService.getPrice());
            booking2.setNotes("Fixed kitchen sink leak - excellent service!");
            booking2.setCustomerAddress("123 Marine Drive, Mumbai, Maharashtra 400001");
            booking2.setCustomerLatitude(19.0760);
            booking2.setCustomerLongitude(72.8777);
            bookingRepository.save(booking2);

            // Booking 3: Pending computer repair service for next week (Provider 2 - Medium distance)
            if (admin != null && !provider2Services.isEmpty()) {
                Service computerService = provider2Services.stream()
                    .filter(s -> s.getName().contains("Computer"))
                    .findFirst().orElse(provider2Services.get(0));
                
                Booking booking3 = new Booking();
                booking3.setCustomer(admin);
                booking3.setServiceProvider(provider2);
                booking3.setService(computerService);
                booking3.setScheduledDateTime(now.plusDays(3).withHour(16).withMinute(0));
                booking3.setEstimatedEndDateTime(now.plusDays(3).withHour(18).withMinute(30));
                booking3.setStatus(BookingStatus.PENDING);
                booking3.setTotalPrice(computerService.getPrice());
                booking3.setNotes("Need virus removal and system optimization");
                booking3.setCustomerAddress("Admin Office, Worli, Mumbai, Maharashtra 400018");
                booking3.setCustomerLatitude(19.0176);
                booking3.setCustomerLongitude(72.8182);
                bookingRepository.save(booking3);
            }

            // Booking 4: Completed math tutoring service from last week (Provider 3 - Far distance)
            if (!provider3Services.isEmpty()) {
                Service mathTutoringService = provider3Services.stream()
                    .filter(s -> s.getName().contains("Mathematics"))
                    .findFirst().orElse(provider3Services.get(0));
                
                Booking booking4 = new Booking();
                booking4.setCustomer(customer);
                booking4.setServiceProvider(provider3);
                booking4.setService(mathTutoringService);
                booking4.setScheduledDateTime(now.minusDays(7).withHour(18).withMinute(0));
                booking4.setEstimatedEndDateTime(now.minusDays(7).withHour(19).withMinute(0));
                booking4.setActualStartDateTime(now.minusDays(7).withHour(18).withMinute(0));
                booking4.setActualEndDateTime(now.minusDays(7).withHour(19).withMinute(15));
                booking4.setStatus(BookingStatus.COMPLETED);
                booking4.setTotalPrice(mathTutoringService.getPrice());
                booking4.setNotes("Online calculus tutoring session - very helpful!");
                booking4.setCustomerAddress("123 Marine Drive, Mumbai, Maharashtra 400001");
                booking4.setCustomerLatitude(19.0760);
                booking4.setCustomerLongitude(72.8777);
                bookingRepository.save(booking4);
            }

            System.out.println("Sample bookings created across different distances:");
            System.out.println("- Provider 1 (3km): Electrical repair & Plumbing service");
            System.out.println("- Provider 2 (8km): Computer repair service");
            System.out.println("- Provider 3 (150km): Math tutoring service");
        }
    }

    private void initializeAvailabilities() {
        if (availabilityRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            
            // Get all service providers
            List<ServiceProvider> providers = serviceProviderRepository.findAll();
            
            for (ServiceProvider provider : providers) {
                // Create availability slots for the next 14 days
                for (int day = 1; day <= 14; day++) {
                    LocalDateTime targetDate = now.plusDays(day);
                    
                    // Morning slot: 9:00 AM - 12:00 PM
                    Availability morningSlot = new Availability();
                    morningSlot.setServiceProvider(provider);
                    morningSlot.setStartDateTime(targetDate.withHour(9).withMinute(0).withSecond(0));
                    morningSlot.setEndDateTime(targetDate.withHour(12).withMinute(0).withSecond(0));
                    morningSlot.setIsRecurring(false);
                    morningSlot.setIsBooked(false);
                    morningSlot.setNotes("Morning availability slot");
                    availabilityRepository.save(morningSlot);
                    
                    // Afternoon slot: 2:00 PM - 6:00 PM
                    Availability afternoonSlot = new Availability();
                    afternoonSlot.setServiceProvider(provider);
                    afternoonSlot.setStartDateTime(targetDate.withHour(14).withMinute(0).withSecond(0));
                    afternoonSlot.setEndDateTime(targetDate.withHour(18).withMinute(0).withSecond(0));
                    afternoonSlot.setIsRecurring(false);
                    afternoonSlot.setIsBooked(false);
                    afternoonSlot.setNotes("Afternoon availability slot");
                    availabilityRepository.save(afternoonSlot);
                    
                    // Weekend evening slot (Friday-Sunday): 6:00 PM - 8:00 PM
                    DayOfWeek dayOfWeek = targetDate.getDayOfWeek();
                    if (dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                        Availability eveningSlot = new Availability();
                        eveningSlot.setServiceProvider(provider);
                        eveningSlot.setStartDateTime(targetDate.withHour(18).withMinute(0).withSecond(0));
                        eveningSlot.setEndDateTime(targetDate.withHour(20).withMinute(0).withSecond(0));
                        eveningSlot.setIsRecurring(false);
                        eveningSlot.setIsBooked(false);
                        eveningSlot.setNotes("Weekend evening availability");
                        availabilityRepository.save(eveningSlot);
                    }
                }
                
                // Create some recurring weekly availability (every Monday 10:00 AM - 4:00 PM)
                Availability recurringSlot = new Availability();
                recurringSlot.setServiceProvider(provider);
                recurringSlot.setStartDateTime(now.plusDays(7).withHour(10).withMinute(0).withSecond(0));
                recurringSlot.setEndDateTime(now.plusDays(7).withHour(16).withMinute(0).withSecond(0));
                recurringSlot.setIsRecurring(true);
                recurringSlot.setDayOfWeek(DayOfWeek.MONDAY);
                recurringSlot.setRecurringStartTime(LocalTime.of(10, 0));
                recurringSlot.setRecurringEndTime(LocalTime.of(16, 0));
                recurringSlot.setIsBooked(false);
                recurringSlot.setNotes("Weekly Monday availability");
                availabilityRepository.save(recurringSlot);
            }
            
            // Mark some random slots as booked to simulate real usage
            List<Availability> allSlots = availabilityRepository.findAll();
            for (int i = 0; i < Math.min(5, allSlots.size()); i += 3) {
                Availability slot = allSlots.get(i);
                slot.setIsBooked(true);
                availabilityRepository.save(slot);
            }
            
            System.out.println("Sample availability data created:");
            System.out.println("- Created 14 days of availability for all providers");
            System.out.println("- Morning slots: 9:00 AM - 12:00 PM");
            System.out.println("- Afternoon slots: 2:00 PM - 6:00 PM");
            System.out.println("- Weekend evening slots: 6:00 PM - 8:00 PM");
            System.out.println("- Recurring Monday slots: 10:00 AM - 4:00 PM");
            System.out.println("- Some slots marked as booked for testing");
        }
    }

    private void initializeRatings() {
        // TODO: Fix rating initialization - temporarily disabled to avoid compilation errors
        System.out.println("Rating initialization skipped - needs to be fixed");
        /*
        if (ratingRepository.count() == 0) {
            // Get the users we created
            User customer = userRepository.findByEmail("customer@test.com").orElse(null);
            User admin = userRepository.findByEmail("admin@servicefinder.com").orElse(null);

            if (customer == null || admin == null) {
                System.out.println("Could not find required users for rating initialization");
                return;
            }

            // Get all completed bookings to rate
            List<Booking> completedBookings = bookingRepository.findByStatusOrderByScheduledDateTimeDesc(BookingStatus.COMPLETED);

            if (!completedBookings.isEmpty()) {
                // Rate the completed plumbing service
                Booking completedBooking = completedBookings.get(0);
                
                Rating rating1 = new Rating();
                rating1.setUser(customer);
                rating1.setServiceProvider(provider);
                rating1.setBooking(completedBooking);
                rating1.setRating(BigDecimal.valueOf(4.5));
                rating1.setReview("Excellent plumbing service! Jane was very professional and fixed the leaky faucet quickly. The work area was left clean and tidy. Highly recommend!");
                rating1.setHelpfulCount(2);
                ratingRepository.save(rating1);

                // If admin also has a completed booking, add another rating
                List<Booking> adminBookings = bookingRepository.findByCustomerAndStatusOrderByScheduledDateTimeDesc(
                    admin, BookingStatus.COMPLETED);
                
                if (!adminBookings.isEmpty()) {
                    Booking adminBooking = adminBookings.get(0);
                    
                    Rating rating2 = new Rating();
                    rating2.setUser(admin);
                    rating2.setServiceProvider(provider);
                    rating2.setBooking(adminBooking);
                    rating2.setRating(BigDecimal.valueOf(5.0));
                    rating2.setReview("Outstanding electrical work! Very satisfied with the quality and professionalism. Will definitely use their services again.");
                    rating2.setHelpfulCount(1);
                    ratingRepository.save(rating2);

                    // Add third rating from customer for electrical service
                    Rating rating3 = new Rating();
                    rating3.setUser(customer);
                    rating3.setServiceProvider(provider);
                    rating3.setBooking(completedBooking);
                    rating3.setRating(BigDecimal.valueOf(4.0));
                    rating3.setReview("Good electrical repair service. The technician was knowledgeable and completed the work as expected. Minor delay in arrival but overall satisfactory.");
                    rating3.setHelpfulCount(0);
                    ratingRepository.save(rating3);

                    // Update provider's average rating
                    updateProviderAverageRating(provider);
                }
            }

            System.out.println("Sample ratings created:");
            System.out.println("- 4.5★ rating for plumbing service with detailed review");
            System.out.println("- 5.0★ rating for admin booking with positive review");
            System.out.println("- 4.0★ rating for electrical service with constructive feedback");
            System.out.println("- Provider average rating updated: " + provider.getAverageRating());
        }
        */
    }
} 