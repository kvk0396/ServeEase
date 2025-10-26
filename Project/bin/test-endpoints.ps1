# ServiceFinder API Testing Script
# This script tests all endpoints in the ServiceFinder application
# Make sure the backend is running on http://localhost:8080

param(
    [string]$BaseUrl = "http://localhost:8080/api",
    [switch]$Verbose = $false
)

# Global variables
$script:customerToken = ""
$script:providerToken = ""
$script:customerId = ""
$script:providerId = ""
$script:serviceId = ""
$script:bookingId = ""
$script:ratingId = ""

# Helper function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = "",
        [string]$Description = ""
    )
    
    $uri = "$BaseUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Verbose) {
            Write-Host "[$Method] $uri" -ForegroundColor Yellow
            if ($Body) {
                Write-Host "Body: $(ConvertTo-Json $Body -Compress)" -ForegroundColor Gray
            }
        }
        
        $response = if ($Body) {
            Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body (ConvertTo-Json $Body -Depth 10)
        } else {
            Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        
        Write-Host "✅ $Description" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "Response: $(ConvertTo-Json $response -Compress)" -ForegroundColor Gray
        }
        
        return $response
    }
    catch {
        Write-Host "❌ $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.ErrorDetails.Message
            if ($errorContent) {
                Write-Host "Error Details: $errorContent" -ForegroundColor Red
            }
        }
        return $null
    }
}

# Test function wrapper
function Test-Endpoint {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    Write-Host "`n=== $TestName ===" -ForegroundColor Cyan
    & $TestScript
}

Write-Host "🚀 Starting ServiceFinder API Testing" -ForegroundColor Magenta
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray

# Test 1: Authentication Endpoints
Test-Endpoint "Authentication Tests" {
    # Register a customer
    $customerData = @{
        firstName = "John"
        lastName = "Doe"
        email = "john.doe@test.com"
        password = "password123"
        phoneNumber = "+1234567890"
        userType = "CUSTOMER"
        address = "123 Main St"
        city = "New York"
        state = "NY"
        zipCode = "10001"
        country = "USA"
    }
    
    $customerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $customerData -Description "Register Customer"
    if ($customerResponse) {
        $script:customerId = $customerResponse.userId
        Write-Host "Customer ID: $($script:customerId)" -ForegroundColor Gray
    }
    
    # Register a service provider
    $providerData = @{
        firstName = "Jane"
        lastName = "Smith"
        email = "jane.smith@test.com"
        password = "password123"
        phoneNumber = "+1234567891"
        userType = "SERVICE_PROVIDER"
        businessName = "Jane's Plumbing Services"
        address = "456 Oak Ave"
        city = "New York"
        state = "NY"
        zipCode = "10002"
        country = "USA"
    }
    
    $providerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $providerData -Description "Register Service Provider"
    if ($providerResponse) {
        $script:providerId = $providerResponse.userId
        Write-Host "Provider ID: $($script:providerId)" -ForegroundColor Gray
    }
    
    # Login customer to get token
    $customerLoginData = @{
        email = "john.doe@test.com"
        password = "password123"
    }
    
    $customerLoginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $customerLoginData -Description "Customer Login"
    if ($customerLoginResponse) {
        $script:customerToken = $customerLoginResponse.token
        Write-Host "Customer Token: $($script:customerToken.Substring(0, 20))..." -ForegroundColor Gray
    }
    
    # Login provider to get token
    $providerLoginData = @{
        email = "jane.smith@test.com"
        password = "password123"
    }
    
    $providerLoginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $providerLoginData -Description "Provider Login"
    if ($providerLoginResponse) {
        $script:providerToken = $providerLoginResponse.token
        Write-Host "Provider Token: $($script:providerToken.Substring(0, 20))..." -ForegroundColor Gray
    }
    
    # Test token validation
    Invoke-ApiRequest -Method "GET" -Endpoint "/auth/validate" -Token $script:customerToken -Description "Validate Customer Token"
}

# Test 2: Service Management
Test-Endpoint "Service Management Tests" {
    if (-not $script:providerToken) {
        Write-Host "⚠️ Skipping service tests - no provider token" -ForegroundColor Yellow
        return
    }
    
    # Create a service
    $serviceData = @{
        name = "Plumbing Repair"
        description = "Professional plumbing repair services for residential properties"
        category = "Home Maintenance"
        subcategory = "Plumbing"
        price = 75.00
        durationMinutes = 120
    }
    
    $serviceResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/services" -Body $serviceData -Token $script:providerToken -Description "Create Service"
    if ($serviceResponse) {
        $script:serviceId = $serviceResponse.id
        Write-Host "Service ID: $($script:serviceId)" -ForegroundColor Gray
    }
    
    # Get all services
    Invoke-ApiRequest -Method "GET" -Endpoint "/services" -Description "Get All Services"
    
    # Get service by ID
    if ($script:serviceId) {
        Invoke-ApiRequest -Method "GET" -Endpoint "/services/$($script:serviceId)" -Description "Get Service by ID"
    }
    
    # Get my services
    Invoke-ApiRequest -Method "GET" -Endpoint "/services/my-services" -Token $script:providerToken -Description "Get My Services"
    
    # Update service
    if ($script:serviceId) {
        $updateData = @{
            price = 85.00
            description = "Updated professional plumbing repair services"
        }
        Invoke-ApiRequest -Method "PUT" -Endpoint "/services/$($script:serviceId)" -Body $updateData -Token $script:providerToken -Description "Update Service"
    }
    
    # Get categories
    Invoke-ApiRequest -Method "GET" -Endpoint "/services/categories" -Description "Get Service Categories"
    
    # Search services by location
    Invoke-ApiRequest -Method "GET" -Endpoint "/services/search/location?latitude=40.7128&longitude=-74.0060&radiusKm=25" -Description "Search Services by Location"
}

# Test 3: Booking Management
Test-Endpoint "Booking Management Tests" {
    if (-not $script:customerToken -or -not $script:serviceId) {
        Write-Host "⚠️ Skipping booking tests - missing customer token or service ID" -ForegroundColor Yellow
        return
    }
    
    # Create a booking
    $bookingData = @{
        serviceId = $script:serviceId
        scheduledDateTime = "2024-12-31T10:00:00"
        notes = "Please call 15 minutes before arrival"
        customerAddress = "123 Main St, Apartment 4B, New York, NY 10001"
        customerLatitude = 40.7128
        customerLongitude = -74.0060
    }
    
    $bookingResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/bookings" -Body $bookingData -Token $script:customerToken -Description "Create Booking"
    if ($bookingResponse) {
        $script:bookingId = $bookingResponse.id
        Write-Host "Booking ID: $($script:bookingId)" -ForegroundColor Gray
    }
    
    # Get booking by ID
    if ($script:bookingId) {
        Invoke-ApiRequest -Method "GET" -Endpoint "/bookings/$($script:bookingId)" -Token $script:customerToken -Description "Get Booking by ID"
    }
    
    # Get customer's bookings
    Invoke-ApiRequest -Method "GET" -Endpoint "/bookings/my-bookings" -Token $script:customerToken -Description "Get Customer Bookings"
    
    # Get provider's bookings
    Invoke-ApiRequest -Method "GET" -Endpoint "/bookings/provider-bookings" -Token $script:providerToken -Description "Get Provider Bookings"
    
    # Get upcoming bookings
    Invoke-ApiRequest -Method "GET" -Endpoint "/bookings/upcoming" -Token $script:customerToken -Description "Get Upcoming Bookings (Customer)"
    Invoke-ApiRequest -Method "GET" -Endpoint "/bookings/upcoming" -Token $script:providerToken -Description "Get Upcoming Bookings (Provider)"
    
    # Confirm booking (provider)
    if ($script:bookingId) {
        Invoke-ApiRequest -Method "POST" -Endpoint "/bookings/$($script:bookingId)/confirm" -Token $script:providerToken -Description "Confirm Booking"
    }
    
    # Start service (provider)
    if ($script:bookingId) {
        Invoke-ApiRequest -Method "POST" -Endpoint "/bookings/$($script:bookingId)/start" -Token $script:providerToken -Description "Start Service"
    }
    
    # Complete service (provider)
    if ($script:bookingId) {
        Invoke-ApiRequest -Method "POST" -Endpoint "/bookings/$($script:bookingId)/complete" -Token $script:providerToken -Description "Complete Service"
    }
}

# Test 4: Rating Management
Test-Endpoint "Rating Management Tests" {
    if (-not $script:customerToken -or -not $script:bookingId) {
        Write-Host "⚠️ Skipping rating tests - missing customer token or booking ID" -ForegroundColor Yellow
        return
    }
    
    # Create a rating
    $ratingData = @{
        bookingId = $script:bookingId
        rating = 4.5
        review = "Great service! Very professional and completed the work on time."
    }
    
    $ratingResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/ratings" -Body $ratingData -Token $script:customerToken -Description "Create Rating"
    if ($ratingResponse) {
        $script:ratingId = $ratingResponse.id
        Write-Host "Rating ID: $($script:ratingId)" -ForegroundColor Gray
    }
    
    # Get rating by ID
    if ($script:ratingId) {
        Invoke-ApiRequest -Method "GET" -Endpoint "/ratings/$($script:ratingId)" -Token $script:customerToken -Description "Get Rating by ID"
    }
    
    # Get customer's ratings
    Invoke-ApiRequest -Method "GET" -Endpoint "/ratings/my-ratings" -Token $script:customerToken -Description "Get Customer Ratings"
    
    # Get provider's ratings
    Invoke-ApiRequest -Method "GET" -Endpoint "/ratings/provider-ratings" -Token $script:providerToken -Description "Get Provider Ratings"
    
    # Get provider ratings (public)
    if ($script:providerId) {
        # Note: We need to get the actual provider ID from the service provider entity
        Invoke-ApiRequest -Method "GET" -Endpoint "/ratings/provider/1" -Description "Get Provider Ratings (Public)"
    }
    
    # Mark review as helpful
    if ($script:ratingId) {
        Invoke-ApiRequest -Method "POST" -Endpoint "/ratings/$($script:ratingId)/helpful" -Token $script:customerToken -Description "Mark Review as Helpful"
    }
    
    # Get rating statistics
    Invoke-ApiRequest -Method "GET" -Endpoint "/ratings/provider/1/stats" -Description "Get Rating Statistics"
    
    # Update rating
    if ($script:ratingId) {
        $updateRatingData = @{
            rating = 5.0
            review = "Excellent service! Highly recommend."
        }
        Invoke-ApiRequest -Method "PUT" -Endpoint "/ratings/$($script:ratingId)" -Body $updateRatingData -Token $script:customerToken -Description "Update Rating"
    }
}

# Test 5: Availability Management
Test-Endpoint "Availability Management Tests" {
    if (-not $script:providerToken) {
        Write-Host "⚠️ Skipping availability tests - no provider token" -ForegroundColor Yellow
        return
    }
    
    # Search availability
    $availabilitySearchData = @{
        latitude = 40.7128
        longitude = -74.0060
        radiusKm = 25.0
        startDate = "2024-12-30T08:00:00"
        endDate = "2024-12-31T18:00:00"
        durationMinutes = 120
        serviceType = "Plumbing"
        limit = 20
    }
    
    Invoke-ApiRequest -Method "POST" -Endpoint "/availability/search" -Body $availabilitySearchData -Description "Search Availability"
    
    # Get provider availability
    Invoke-ApiRequest -Method "GET" -Endpoint "/availability/provider/1" -Description "Get Provider Availability"
    
    # Get my availability
    Invoke-ApiRequest -Method "GET" -Endpoint "/availability/my-availability" -Token $script:providerToken -Description "Get My Availability"
    
    # Quick availability search
    Invoke-ApiRequest -Method "GET" -Endpoint "/availability/search/quick?latitude=40.7128&longitude=-74.0060&radiusKm=25&durationMinutes=120&serviceType=plumbing" -Description "Quick Availability Search"
    
    # Get providers available today
    Invoke-ApiRequest -Method "GET" -Endpoint "/availability/providers/available-today?latitude=40.7128&longitude=-74.0060" -Description "Get Providers Available Today"
}

# Test 6: Geolocation Search
Test-Endpoint "Geolocation Search Tests" {
    if (-not $script:customerToken) {
        Write-Host "⚠️ Skipping geolocation tests - no customer token" -ForegroundColor Yellow
        return
    }
    
    # Search by location
    $locationSearchData = @{
        latitude = 40.7128
        longitude = -74.0060
        radiusKm = 25.0
        minRating = 3.0
        category = "Home Maintenance"
        maxPrice = 100.0
        limit = 20
        sortByDistance = $true
    }
    
    Invoke-ApiRequest -Method "POST" -Endpoint "/search/location" -Body $locationSearchData -Token $script:customerToken -Description "Search by Location"
    
    # Find available providers
    Invoke-ApiRequest -Method "GET" -Endpoint "/search/available?latitude=40.7128&longitude=-74.0060&minRating=3.0&category=Home Maintenance&limit=20" -Token $script:customerToken -Description "Find Available Providers"
    
    # Calculate distance
    Invoke-ApiRequest -Method "GET" -Endpoint "/search/distance?lat1=40.7128&lon1=-74.0060&lat2=40.7589&lon2=-73.9851" -Token $script:customerToken -Description "Calculate Distance"
}

# Test 7: Error Handling
Test-Endpoint "Error Handling Tests" {
    # Test unauthorized access
    Invoke-ApiRequest -Method "GET" -Endpoint "/services/my-services" -Description "Unauthorized Access (should fail)"
    
    # Test invalid data
    $invalidService = @{
        name = ""  # Invalid: empty name
        price = -10  # Invalid: negative price
    }
    Invoke-ApiRequest -Method "POST" -Endpoint "/services" -Body $invalidService -Token $script:providerToken -Description "Invalid Service Data (should fail)"
    
    # Test non-existent resource
    Invoke-ApiRequest -Method "GET" -Endpoint "/services/99999" -Description "Non-existent Service (should fail)"
}

# Summary
Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Magenta
Write-Host "Summary of created test data:" -ForegroundColor Gray
Write-Host "- Customer ID: $script:customerId" -ForegroundColor Gray
Write-Host "- Provider ID: $script:providerId" -ForegroundColor Gray
Write-Host "- Service ID: $script:serviceId" -ForegroundColor Gray
Write-Host "- Booking ID: $script:bookingId" -ForegroundColor Gray
Write-Host "- Rating ID: $script:ratingId" -ForegroundColor Gray

Write-Host "`n📊 You can now check Swagger UI at: $BaseUrl/swagger-ui.html" -ForegroundColor Cyan
Write-Host "📊 H2 Console available at: $BaseUrl/h2-console" -ForegroundColor Cyan 