# Complete Swagger UI Testing Guide for ServiceFinder API

This guide provides step-by-step instructions with sample requests and responses for testing all ServiceFinder API endpoints using Swagger UI.

## 🚀 Getting Started

1. **Start the backend**: Ensure ServiceFinder is running on `http://localhost:8080`
2. **Open Swagger UI**: Navigate to `http://localhost:8080/api/swagger-ui.html`
3. **Follow the steps below in order** for the best testing experience

---

## 📋 STEP 1: Authentication - Register Users

### 1.1 Register a Customer Account

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.customer@test.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "userType": "CUSTOMER",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

**Expected Response** (201 Created):
```json
{
  "message": "Registration successful",
  "email": "john.customer@test.com",
  "role": "CUSTOMER",
  "userId": 1,
  "fullName": "John Doe"
}
```

**📝 Note**: Registration is successful! No token is provided - you'll need to login to get a token.

### 1.2 Register a Service Provider Account

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.provider@test.com",
  "password": "password123",
  "phoneNumber": "+1234567891",
  "userType": "SERVICE_PROVIDER",
  "businessName": "Jane's Professional Services",
  "address": "456 Oak Avenue",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "country": "USA"
}
```

**Expected Response** (201 Created):
```json
{
  "message": "Registration successful",
  "email": "jane.provider@test.com",
  "role": "SERVICE_PROVIDER",
  "userId": 2,
  "fullName": "Jane Smith"
}
```

**📝 Note**: Registration is successful! No token is provided - you'll need to login to get a token.

---

## 🔑 STEP 2: Authentication - Login and Token Validation

**🔒 Security Note**: Registration only creates the user account. JWT tokens are only generated during login for better security practices.

### 2.1 Test Customer Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john.customer@test.com",
  "password": "password123"
}
```

**Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmN1c3RvbWVyQHRlc3QuY29tIiwiaWF0IjoxNzM0...",
  "email": "john.customer@test.com",
  "role": "CUSTOMER",
  "userId": 1,
  "fullName": "John Doe"
}
```

**📝 Note**: Copy the `token` value - you'll need it for customer operations!

### 2.2 Test Provider Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "jane.provider@test.com",
  "password": "password123"
}
```

**Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lLnByb3ZpZGVyQHRlc3QuY29tIiwiaWF0IjoxNzM0...",
  "email": "jane.provider@test.com",
  "role": "SERVICE_PROVIDER",
  "userId": 2,
  "fullName": "Jane Smith"
}
```

**📝 Note**: Copy the `token` value - you'll need it for provider operations!

### 2.3 Set Authorization in Swagger

1. Click the **"Authorize"** button at the top of Swagger UI
2. In the "bearerAuth" field, enter: `Bearer <your_customer_token>`
3. Click **"Authorize"** then **"Close"**

### 2.3 Validate Token

**Endpoint**: `GET /auth/validate`

**Headers**: Authorization is automatically added by Swagger

**Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmN1c3RvbWVyQHRlc3QuY29tIiwiaWF0IjoxNzM0...",
  "email": "john.customer@test.com",
  "role": "CUSTOMER",
  "userId": 1,
  "fullName": "John Doe"
}
```

---

## 🛠️ STEP 3: Service Management (Switch to Provider Token)

### 3.1 Update Authorization to Provider Token

1. Click **"Authorize"** again
2. Replace with: `Bearer <your_provider_token>`
3. Click **"Authorize"** then **"Close"**

### 3.2 Create a Service

**Endpoint**: `POST /services`

**Request Body**:
```json
{
  "name": "Professional Plumbing Repair",
  "description": "Expert plumbing services including pipe repair, leak fixing, and installation of fixtures. Available 24/7 for emergency repairs.",
  "category": "Home Maintenance",
  "subcategory": "Plumbing",
  "price": 85.50,
  "durationMinutes": 120
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "name": "Professional Plumbing Repair",
  "description": "Expert plumbing services including pipe repair, leak fixing, and installation of fixtures. Available 24/7 for emergency repairs.",
  "category": "Home Maintenance",
  "subcategory": "Plumbing",
  "price": 85.50,
  "durationMinutes": 120,
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0,
    "totalRatings": 0,
    "yearsOfExperience": 0,
    "verificationStatus": "PENDING"
  }
}
```

**📝 Note**: Copy the service `id` (should be 1) for later use!

### 3.3 Create Another Service

**Endpoint**: `POST /services`

**Request Body**:
```json
{
  "name": "Electrical Installation & Repair",
  "description": "Licensed electrical services for residential and commercial properties. Safety inspections included.",
  "category": "Home Maintenance",
  "subcategory": "Electrical",
  "price": 95.00,
  "durationMinutes": 90
}
```

**Expected Response** (201 Created):
```json
{
  "id": 2,
  "name": "Electrical Installation & Repair",
  "description": "Licensed electrical services for residential and commercial properties. Safety inspections included.",
  "category": "Home Maintenance",
  "subcategory": "Electrical",
  "price": 95.00,
  "durationMinutes": 90,
  "active": true,
  "createdAt": "2024-01-15T10:35:00",
  "updatedAt": "2024-01-15T10:35:00",
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0,
    "totalRatings": 0,
    "yearsOfExperience": 0,
    "verificationStatus": "PENDING"
  }
}
```

### 3.4 Get All Services (No Auth Required)

**Endpoint**: `GET /services`

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Professional Plumbing Repair",
    "description": "Expert plumbing services including pipe repair, leak fixing, and installation of fixtures. Available 24/7 for emergency repairs.",
    "category": "Home Maintenance",
    "subcategory": "Plumbing",
    "price": 85.50,
    "durationMinutes": 120,
    "active": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "serviceProvider": {
      "id": 1,
      "businessName": "Jane's Professional Services",
      "contactName": "Jane Smith",
      "email": "jane.provider@test.com",
      "phoneNumber": "+1234567891",
      "averageRating": 0.0,
      "totalRatings": 0,
      "yearsOfExperience": 0,
      "verificationStatus": "PENDING"
    }
  },
  {
    "id": 2,
    "name": "Electrical Installation & Repair",
    "description": "Licensed electrical services for residential and commercial properties. Safety inspections included.",
    "category": "Home Maintenance",
    "subcategory": "Electrical",
    "price": 95.00,
    "durationMinutes": 90,
    "active": true,
    "createdAt": "2024-01-15T10:35:00",
    "updatedAt": "2024-01-15T10:35:00",
    "serviceProvider": {
      "id": 1,
      "businessName": "Jane's Professional Services",
      "contactName": "Jane Smith",
      "email": "jane.provider@test.com",
      "phoneNumber": "+1234567891",
      "averageRating": 0.0,
      "totalRatings": 0,
      "yearsOfExperience": 0,
      "verificationStatus": "PENDING"
    }
  }
]
```

### 3.5 Get My Services (Provider Only)

**Endpoint**: `GET /services/my-services`

**Expected Response** (200 OK): Same as above array

### 3.6 Update a Service

**Endpoint**: `PUT /services/1`

**Request Body**:
```json
{
  "price": 90.00,
  "description": "Updated: Expert plumbing services including pipe repair, leak fixing, and installation of fixtures. Available 24/7 for emergency repairs. Now with 5% discount!"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "name": "Professional Plumbing Repair",
  "description": "Updated: Expert plumbing services including pipe repair, leak fixing, and installation of fixtures. Available 24/7 for emergency repairs. Now with 5% discount!",
  "category": "Home Maintenance",
  "subcategory": "Plumbing",
  "price": 90.00,
  "durationMinutes": 120,
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:40:00",
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0,
    "totalRatings": 0,
    "yearsOfExperience": 0,
    "verificationStatus": "PENDING"
  }
}
```

---

## 📅 STEP 4: Booking Management (Switch to Customer Token)

### 4.1 Update Authorization to Customer Token

1. Click **"Authorize"**
2. Replace with: `Bearer <your_customer_token>`
3. Click **"Authorize"** then **"Close"**

### 4.2 Create a Booking

**Endpoint**: `POST /bookings`

**Request Body**:
```json
{
  "serviceId": 1,
  "scheduledDateTime": "2024-12-31T14:30:00",
  "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
  "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "scheduledDateTime": "2024-12-31T14:30:00",
  "estimatedEndDateTime": "2024-12-31T16:30:00",
  "actualStartDateTime": null,
  "actualEndDateTime": null,
  "status": "PENDING",
  "totalPrice": 90.00,
  "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
  "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060,
  "cancellationReason": null,
  "cancelledBy": null,
  "cancellationDateTime": null,
  "createdAt": "2024-01-15T10:45:00",
  "updatedAt": "2024-01-15T10:45:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com",
    "phoneNumber": "+1234567890"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0
  },
  "service": {
    "id": 1,
    "name": "Professional Plumbing Repair",
    "category": "Home Maintenance",
    "subcategory": "Plumbing",
    "price": 90.00,
    "durationMinutes": 120
  }
}
```

**📝 Note**: Copy the booking `id` (should be 1) for later use!

### 4.3 Get Booking by ID

**Endpoint**: `GET /bookings/1`

**Expected Response** (200 OK): Same as above booking object

### 4.4 Get My Bookings (Customer)

**Endpoint**: `GET /bookings/my-bookings`

**Query Parameters**: 
- page: 0
- size: 10

**Expected Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "scheduledDateTime": "2024-12-31T14:30:00",
      "estimatedEndDateTime": "2024-12-31T16:30:00",
      "actualStartDateTime": null,
      "actualEndDateTime": null,
      "status": "PENDING",
      "totalPrice": 90.00,
      "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
      "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
      "customerLatitude": 40.7128,
      "customerLongitude": -74.0060,
      "cancellationReason": null,
      "cancelledBy": null,
      "cancellationDateTime": null,
      "createdAt": "2024-01-15T10:45:00",
      "updatedAt": "2024-01-15T10:45:00",
      "customer": {
        "id": 1,
        "name": "John Doe",
        "email": "john.customer@test.com",
        "phoneNumber": "+1234567890"
      },
      "serviceProvider": {
        "id": 1,
        "businessName": "Jane's Professional Services",
        "contactName": "Jane Smith",
        "email": "jane.provider@test.com",
        "phoneNumber": "+1234567891",
        "averageRating": 0.0
      },
      "service": {
        "id": 1,
        "name": "Professional Plumbing Repair",
        "category": "Home Maintenance",
        "subcategory": "Plumbing",
        "price": 90.00,
        "durationMinutes": 120
      }
    }
  ],
  "pageable": {
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "pageSize": 10,
    "pageNumber": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

---

## 🔄 STEP 5: Booking Lifecycle (Switch to Provider Token)

### 5.1 Update Authorization to Provider Token

1. Click **"Authorize"**
2. Replace with: `Bearer <your_provider_token>`
3. Click **"Authorize"** then **"Close"**

### 5.2 Get Provider Bookings

**Endpoint**: `GET /bookings/provider-bookings`

**Expected Response** (200 OK): Similar to customer bookings but from provider perspective

### 5.3 Confirm Booking

**Endpoint**: `POST /bookings/1/confirm`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "scheduledDateTime": "2024-12-31T14:30:00",
  "estimatedEndDateTime": "2024-12-31T16:30:00",
  "actualStartDateTime": null,
  "actualEndDateTime": null,
  "status": "CONFIRMED",
  "totalPrice": 90.00,
  "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
  "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060,
  "cancellationReason": null,
  "cancelledBy": null,
  "cancellationDateTime": null,
  "createdAt": "2024-01-15T10:45:00",
  "updatedAt": "2024-01-15T10:50:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com",
    "phoneNumber": "+1234567890"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0
  },
  "service": {
    "id": 1,
    "name": "Professional Plumbing Repair",
    "category": "Home Maintenance",
    "subcategory": "Plumbing",
    "price": 90.00,
    "durationMinutes": 120
  }
}
```

### 5.4 Start Service

**Endpoint**: `POST /bookings/1/start`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "scheduledDateTime": "2024-12-31T14:30:00",
  "estimatedEndDateTime": "2024-12-31T16:30:00",
  "actualStartDateTime": "2024-01-15T10:55:00",
  "actualEndDateTime": null,
  "status": "IN_PROGRESS",
  "totalPrice": 90.00,
  "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
  "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060,
  "cancellationReason": null,
  "cancelledBy": null,
  "cancellationDateTime": null,
  "createdAt": "2024-01-15T10:45:00",
  "updatedAt": "2024-01-15T10:55:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com",
    "phoneNumber": "+1234567890"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0
  },
  "service": {
    "id": 1,
    "name": "Professional Plumbing Repair",
    "category": "Home Maintenance",
    "subcategory": "Plumbing",
    "price": 90.00,
    "durationMinutes": 120
  }
}
```

### 5.5 Complete Service

**Endpoint**: `POST /bookings/1/complete`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "scheduledDateTime": "2024-12-31T14:30:00",
  "estimatedEndDateTime": "2024-12-31T16:30:00",
  "actualStartDateTime": "2024-01-15T10:55:00",
  "actualEndDateTime": "2024-01-15T11:00:00",
  "status": "COMPLETED",
  "totalPrice": 90.00,
  "notes": "Please call 15 minutes before arrival. Apartment entrance is on the side of the building.",
  "customerAddress": "123 Main Street, Apartment 4B, New York, NY 10001",
  "customerLatitude": 40.7128,
  "customerLongitude": -74.0060,
  "cancellationReason": null,
  "cancelledBy": null,
  "cancellationDateTime": null,
  "createdAt": "2024-01-15T10:45:00",
  "updatedAt": "2024-01-15T11:00:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com",
    "phoneNumber": "+1234567890"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "email": "jane.provider@test.com",
    "phoneNumber": "+1234567891",
    "averageRating": 0.0
  },
  "service": {
    "id": 1,
    "name": "Professional Plumbing Repair",
    "category": "Home Maintenance",
    "subcategory": "Plumbing",
    "price": 90.00,
    "durationMinutes": 120
  }
}
```

---

## ⭐ STEP 6: Rating Management (Switch to Customer Token)

### 6.1 Update Authorization to Customer Token

1. Click **"Authorize"**
2. Replace with: `Bearer <your_customer_token>`
3. Click **"Authorize"** then **"Close"**

### 6.2 Create a Rating

**Endpoint**: `POST /ratings`

**Request Body**:
```json
{
  "bookingId": 1,
  "rating": 4.5,
  "review": "Excellent service! Jane arrived on time, was very professional, and fixed the plumbing issue quickly. The work area was left clean and tidy. Highly recommend!"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "rating": 4.5,
  "review": "Excellent service! Jane arrived on time, was very professional, and fixed the plumbing issue quickly. The work area was left clean and tidy. Highly recommend!",
  "helpfulCount": 0,
  "createdAt": "2024-01-15T11:05:00",
  "updatedAt": "2024-01-15T11:05:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "averageRating": 4.5
  },
  "booking": {
    "id": 1,
    "serviceName": "Professional Plumbing Repair",
    "scheduledDateTime": "2024-12-31T14:30:00",
    "status": "COMPLETED"
  }
}
```

**📝 Note**: Copy the rating `id` (should be 1) for later use!

### 6.3 Get Rating by ID

**Endpoint**: `GET /ratings/1`

**Expected Response** (200 OK): Same as above rating object

### 6.4 Get My Ratings

**Endpoint**: `GET /ratings/my-ratings`

**Expected Response** (200 OK): Paginated response with the rating you created

### 6.5 Mark Review as Helpful

**Endpoint**: `POST /ratings/1/helpful`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "rating": 4.5,
  "review": "Excellent service! Jane arrived on time, was very professional, and fixed the plumbing issue quickly. The work area was left clean and tidy. Highly recommend!",
  "helpfulCount": 1,
  "createdAt": "2024-01-15T11:05:00",
  "updatedAt": "2024-01-15T11:10:00",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john.customer@test.com"
  },
  "serviceProvider": {
    "id": 1,
    "businessName": "Jane's Professional Services",
    "contactName": "Jane Smith",
    "averageRating": 4.5
  },
  "booking": {
    "id": 1,
    "serviceName": "Professional Plumbing Repair",
    "scheduledDateTime": "2024-12-31T14:30:00",
    "status": "COMPLETED"
  }
}
```

---

## 📊 STEP 7: Public Endpoints (No Auth Required)

### 7.1 Get Provider Ratings (Public)

**Endpoint**: `GET /ratings/provider/1`

**Expected Response** (200 OK): Paginated list of ratings for the provider

### 7.2 Get Rating Statistics

**Endpoint**: `GET /ratings/provider/1/stats`

**Expected Response** (200 OK):
```json
{
  "averageRating": 4.5,
  "totalRatings": 1,
  "fiveStarPercentage": 0.0,
  "fourStarPercentage": 100.0,
  "threeStarPercentage": 0.0,
  "twoStarPercentage": 0.0,
  "oneStarPercentage": 0.0
}
```

### 7.3 Get Service Categories

**Endpoint**: `GET /services/categories`

**Expected Response** (200 OK):
```json
[
  "Home Maintenance"
]
```

### 7.4 Get Subcategories

**Endpoint**: `GET /services/subcategories?category=Home Maintenance`

**Expected Response** (200 OK):
```json
[
  "Plumbing",
  "Electrical"
]
```

---

## 🗺️ STEP 8: Geolocation Search (Customer Token Required)

### 8.1 Update Authorization to Customer Token

1. Click **"Authorize"**
2. Replace with: `Bearer <your_customer_token>`
3. Click **"Authorize"** then **"Close"**

### 8.2 Search by Location

**Endpoint**: `POST /search/location`

**Request Body**:
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

**Expected Response** (200 OK):
```json
{
  "metadata": {
    "totalResults": 1,
    "searchLatitude": 40.7128,
    "searchLongitude": -74.0060,
    "searchRadiusKm": 25.0,
    "sortedByDistance": true,
    "minDistance": 5.2,
    "maxDistance": 5.2
  },
  "providers": [
    {
      "id": 1,
      "businessName": "Jane's Professional Services",
      "description": "",
      "averageRating": 4.5,
      "totalRatings": 1,
      "yearsOfExperience": 0,
      "verificationStatus": "PENDING",
      "distance": 5.2,
      "serviceRadiusKm": 0.0,
      "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "latitude": null,
        "longitude": null
      },
      "contact": {
        "name": "Jane Smith",
        "email": "jane.provider@test.com",
        "phoneNumber": "+1234567891"
      },
      "services": [
        {
          "id": 1,
          "name": "Professional Plumbing Repair",
          "category": "Home Maintenance",
          "subcategory": "Plumbing",
          "price": 90.00,
          "durationMinutes": 120
        },
        {
          "id": 2,
          "name": "Electrical Installation & Repair",
          "category": "Home Maintenance",
          "subcategory": "Electrical",
          "price": 95.00,
          "durationMinutes": 90
        }
      ]
    }
  ]
}
```

### 8.3 Calculate Distance

**Endpoint**: `GET /search/distance?lat1=40.7128&lon1=-74.0060&lat2=40.7589&lon2=-73.9851`

**Expected Response** (200 OK):
```json
{
  "distanceKm": 5.23,
  "distanceMiles": 3.25,
  "point1": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "point2": {
    "latitude": 40.7589,
    "longitude": -73.9851
  }
}
```

---

## 📅 STEP 9: Availability Management

### 9.1 Search Availability (No Auth Required)

**Endpoint**: `POST /availability/search`

**Request Body**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusKm": 25.0,
  "startDate": "2024-12-30T08:00:00",
  "endDate": "2024-12-31T18:00:00",
  "durationMinutes": 120,
  "serviceType": "Plumbing",
  "limit": 20
}
```

**Expected Response** (200 OK):
```json
[]
```
*Note: Empty array since no availability slots have been created yet*

### 9.2 Quick Availability Search

**Endpoint**: `GET /availability/search/quick?latitude=40.7128&longitude=-74.0060&radiusKm=25&durationMinutes=120&serviceType=plumbing`

**Expected Response** (200 OK):
```json
[]
```

---

## 🚨 STEP 10: Error Testing

### 10.1 Test Unauthorized Access

**Endpoint**: `GET /services/my-services` (without authorization)

1. Click **"Authorize"** and clear the token field
2. Click **"Authorize"** then **"Close"**
3. Try the endpoint

**Expected Response** (401 Unauthorized):
```json
{
  "timestamp": "2024-01-15T11:15:00.123+00:00",
  "status": 401,
  "error": "Unauthorized",
  "path": "/api/services/my-services"
}
```

### 10.2 Test Invalid Data

**Endpoint**: `POST /services` (with provider token but invalid data)

1. Set authorization back to provider token
2. Use invalid request body:

**Request Body**:
```json
{
  "name": "",
  "price": -10
}
```

**Expected Response** (400 Bad Request):
```json
{
  "error": "Service creation failed",
  "message": "Validation failed: name is required, price must be greater than 0"
}
```

### 10.3 Test Non-existent Resource

**Endpoint**: `GET /services/99999`

**Expected Response** (404 Not Found):
```json
{
  "timestamp": "2024-01-15T11:20:00.123+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/services/99999"
}
```

---

## 🎉 Congratulations!

You've successfully tested all major ServiceFinder API endpoints! Here's what you accomplished:

✅ **Authentication**: Registered users, logged in, validated tokens  
✅ **Service Management**: Created, read, updated services  
✅ **Booking Lifecycle**: Created booking → Confirmed → Started → Completed  
✅ **Rating System**: Created and managed ratings  
✅ **Search & Geolocation**: Location-based searches and distance calculations  
✅ **Availability Management**: Searched for available time slots  
✅ **Error Handling**: Tested unauthorized access and invalid data  

## 📋 Next Steps

1. **Explore Additional Endpoints**: Try other endpoints not covered in this guide
2. **Test Edge Cases**: Try different combinations of parameters and filters
3. **Database Inspection**: Check the H2 console at `http://localhost:8080/api/h2-console`
4. **Performance Testing**: Use tools like Postman or JMeter for load testing
5. **Integration Testing**: Test the API with a frontend application

## 🔍 Quick Reference

- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **H2 Console**: `http://localhost:8080/api/h2-console`
- **OpenAPI Docs**: `http://localhost:8080/api/v3/api-docs`

**Test Accounts Created**:
- Customer: `john.customer@test.com` / `password123`
- Provider: `jane.provider@test.com` / `password123` 