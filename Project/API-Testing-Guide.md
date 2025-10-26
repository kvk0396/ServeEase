# ServiceFinder API Testing Guide

This guide provides comprehensive information about testing all endpoints in the ServiceFinder application.

## Prerequisites

1. **Backend Running**: Ensure the ServiceFinder backend is running on `http://localhost:8080`
2. **PowerShell**: PowerShell 5.0 or later for running the test scripts
3. **Network Access**: Ensure your system can access localhost:8080

## Quick Start

### Option 1: Run Automated Tests
```powershell
# Navigate to the project directory
cd Project

# Run basic tests
.\run-tests.ps1

# Run tests with verbose output
.\run-tests.ps1 -Verbose

# Get help
.\run-tests.ps1 -Help
```

### Option 2: Manual Testing via Swagger UI
1. Open your browser and go to: `http://localhost:8080/api/swagger-ui.html`
2. Use the interactive Swagger interface to test endpoints
3. Follow the authentication flow described below

## API Endpoints Overview

### Base URL
All endpoints are prefixed with: `http://localhost:8080/api`

### Authentication Endpoints (`/auth`)

#### 1. Register User
- **POST** `/auth/register`
- **Description**: Register a new customer or service provider
- **Body Example**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "userType": "CUSTOMER",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

#### 2. Login
- **POST** `/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Body Example**:
```json
{
  "email": "john.doe@test.com",
  "password": "password123"
}
```

#### 3. Validate Token
- **GET** `/auth/validate`
- **Description**: Validate JWT token
- **Headers**: `Authorization: Bearer <token>`

### Service Management Endpoints (`/services`)

#### 1. Create Service (Provider Only)
- **POST** `/services`
- **Description**: Create a new service
- **Headers**: `Authorization: Bearer <provider_token>`
- **Body Example**:
```json
{
  "name": "Plumbing Repair",
  "description": "Professional plumbing repair services",
  "category": "Home Maintenance",
  "subcategory": "Plumbing",
  "price": 75.00,
  "durationMinutes": 120
}
```

#### 2. Get All Services
- **GET** `/services`
- **Query Parameters**: 
  - `category` (optional)
  - `subcategory` (optional)
  - `search` (optional)
  - `minPrice` (optional)
  - `maxPrice` (optional)

#### 3. Get Service by ID
- **GET** `/services/{id}`

#### 4. Get My Services (Provider Only)
- **GET** `/services/my-services`
- **Headers**: `Authorization: Bearer <provider_token>`

#### 5. Update Service (Provider Only)
- **PUT** `/services/{id}`
- **Headers**: `Authorization: Bearer <provider_token>`

#### 6. Delete Service (Provider Only)
- **DELETE** `/services/{id}`
- **Headers**: `Authorization: Bearer <provider_token>`

### Booking Management Endpoints (`/bookings`)

#### 1. Create Booking (Customer Only)
- **POST** `/bookings`
- **Headers**: `Authorization: Bearer <customer_token>`
- **Body Example**:
```json
{
  "serviceId": 1,
  "scheduledDateTime": "2024-12-31T10:00:00",
  "notes": "Please call 15 minutes before arrival",
  "customerAddress": "123 Main St, Apartment 4B",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060
}
```

#### 2. Get Booking by ID
- **GET** `/bookings/{id}`
- **Headers**: `Authorization: Bearer <token>`

#### 3. Get My Bookings (Customer)
- **GET** `/bookings/my-bookings`
- **Headers**: `Authorization: Bearer <customer_token>`

#### 4. Get Provider Bookings
- **GET** `/bookings/provider-bookings`
- **Headers**: `Authorization: Bearer <provider_token>`

#### 5. Booking Status Management (Provider)
- **POST** `/bookings/{id}/confirm` - Confirm booking
- **POST** `/bookings/{id}/start` - Start service
- **POST** `/bookings/{id}/complete` - Complete service
- **POST** `/bookings/{id}/cancel` - Cancel booking

### Rating Management Endpoints (`/ratings`)

#### 1. Create Rating (Customer Only)
- **POST** `/ratings`
- **Headers**: `Authorization: Bearer <customer_token>`
- **Body Example**:
```json
{
  "bookingId": 1,
  "rating": 4.5,
  "review": "Great service! Very professional."
}
```

#### 2. Get Rating by ID
- **GET** `/ratings/{id}`

#### 3. Get My Ratings (Customer)
- **GET** `/ratings/my-ratings`
- **Headers**: `Authorization: Bearer <customer_token>`

#### 4. Get Provider Ratings
- **GET** `/ratings/provider/{providerId}`

#### 5. Get Rating Statistics
- **GET** `/ratings/provider/{providerId}/stats`

### Availability Management Endpoints (`/availability`)

#### 1. Search Availability
- **POST** `/availability/search`
- **Body Example**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusKm": 25.0,
  "startDate": "2024-12-30T08:00:00",
  "endDate": "2024-12-31T18:00:00",
  "durationMinutes": 120,
  "serviceType": "Plumbing"
}
```

#### 2. Get Provider Availability
- **GET** `/availability/provider/{providerId}`

#### 3. Quick Availability Search
- **GET** `/availability/search/quick`
- **Query Parameters**: `latitude`, `longitude`, `radiusKm`, `serviceType`, etc.

### Geolocation Search Endpoints (`/search`)

#### 1. Search by Location (Customer/Admin)
- **POST** `/search/location`
- **Headers**: `Authorization: Bearer <token>`
- **Body Example**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusKm": 25.0,
  "minRating": 3.0,
  "category": "Home Maintenance",
  "maxPrice": 100.0,
  "limit": 20,
  "sortByDistance": true
}
```

#### 2. Find Available Providers
- **GET** `/search/available`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `latitude`, `longitude`, `minRating`, `category`, `limit`

#### 3. Calculate Distance
- **GET** `/search/distance`
- **Query Parameters**: `lat1`, `lon1`, `lat2`, `lon2`

## Testing Workflow

### 1. Authentication Flow
1. Register a customer account
2. Register a service provider account
3. Login to get JWT tokens
4. Use tokens for subsequent requests

### 2. Service Provider Workflow
1. Login as service provider
2. Create services
3. Manage availability
4. Handle bookings (confirm, start, complete)

### 3. Customer Workflow
1. Login as customer
2. Search for services
3. Create bookings
4. Rate completed services

### 4. Complete Test Scenario
```powershell
# Run the comprehensive test script
.\test-endpoints.ps1 -Verbose
```

This script will:
1. Register both customer and provider accounts
2. Create a service
3. Make a booking
4. Progress through the booking lifecycle
5. Create a rating
6. Test all search and filtering endpoints

## Error Testing

The test script also includes error scenarios:
- Unauthorized access attempts
- Invalid data submissions
- Non-existent resource requests
- Invalid token usage

## Database Access

You can inspect the H2 database at: `http://localhost:8080/api/h2-console`
- **JDBC URL**: `jdbc:h2:mem:servicefinder`
- **Username**: `sa`
- **Password**: `password`

## Troubleshooting

### Common Issues

1. **Backend Not Running**
   - Ensure the Spring Boot application is started
   - Check port 8080 is not in use by another application

2. **Authentication Errors**
   - Verify JWT tokens are properly included in headers
   - Check token expiration (default: 24 hours)

3. **Permission Errors**
   - Ensure correct user roles for endpoints
   - Customers can only access customer endpoints
   - Providers can only access provider endpoints

4. **Data Validation Errors**
   - Check required fields are provided
   - Verify data formats (dates, emails, phone numbers)
   - Ensure numeric constraints are met

### PowerShell Execution Policy
If you encounter execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## API Documentation

For complete API documentation with interactive testing:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`

## Test Data

The automated tests create the following test data:
- Customer: john.doe@test.com / password123
- Provider: jane.smith@test.com / password123
- Service: Plumbing Repair ($75, 120 minutes)
- Sample booking and rating data

You can use this data for additional manual testing through Swagger UI. 