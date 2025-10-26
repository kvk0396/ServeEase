# 🚀 ServeEase – Local Service Provider Platform

ServeEase is a **full-stack service management platform** that connects customers with verified local service providers.  
It streamlines **service discovery, booking, ratings, and availability management** through a modern React frontend and a secure Spring Boot backend.

## 🧠 Overview

**ServeEase** bridges the gap between customers and local service providers by enabling seamless service booking, real-time updates, and transparent feedback.

- Customers can browse, book, and rate services.
- Service providers can manage availability, bookings, and service offerings.
- Admins oversee system operations and verification.

---

## 🌟 Features

### 🧍 Customer Features
- **Service Discovery** – Browse and search by category or location  
- **Service Details** – View provider profiles, pricing, and reviews  
- **Booking Management** – Create, modify, or cancel bookings  
- **Ratings & Reviews** – Rate completed services  
- **Dashboard** – Track booking history and active services  

### 🧰 Provider Features
- **Business Dashboard** – Monitor bookings and performance  
- **Service Management** – Create, update, or remove service listings  
- **Availability Management** – Manage work hours and schedules  
- **Customer Insights** – View ratings and feedback  
- **Booking Handling** – Approve or decline customer requests  

### ⚙️ General Platform Features
- **JWT Authentication** – Secure token-based login for all roles  
- **Role-Based Access Control** – Separate dashboards for admin, customer, and provider  
- **Real-Time Notifications** – Live booking status updates  
- **Modern UI/UX** – Fully responsive design with smooth interactions  
- **Test Data Included** – Preloaded sample users for testing  

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Spring Boot 3.2.0, Java 17, Spring Security, JPA/Hibernate |
| **Authentication** | JWT (JSON Web Tokens) |
| **Database** | MySQL |
| **Build Tools** | Maven, npm |
| **State Management** | Zustand + TanStack Query |

---

## Getting Started - Backend setup

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**
   - Application: http://localhost:8080/api
   - **Swagger UI**: http://localhost:8080/api/swagger-ui.html
   - **API Docs**: http://localhost:8080/api/v3/api-docs
  
## 📦 Frontend Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- ServiceFinder Backend API running

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd servicefinder-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_APP_NAME=ServiceFinder
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### 📊 **Available Test Users**

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| `admin@servicefinder.com` | `admin123` | ADMIN | Full system access |
| `customer@test.com` | `customer123` | CUSTOMER | Customer features |
| `provider@test.com` | `provider123` | SERVICE_PROVIDER | Provider features |

## Project Structure - Backend

```
src/
├── main/
│   ├── java/com/servicefinder/
│   │   ├── ServiceFinderApplication.java    # Main application class
│   │   ├── config/                          # Configuration classes
│   │   │   ├── SecurityConfig.java          # Spring Security configuration
│   │   │   └── DataInitializer.java         # Test data initialization
│   │   ├── controller/                      # REST controllers
│   │   │   └── AuthController.java          # Authentication endpoints
│   │   ├── dto/                             # Data Transfer Objects
│   │   │   ├── AuthRequest.java             # Login request DTO
│   │   │   └── AuthResponse.java            # Login response DTO
│   │   ├── model/                           # JPA entities
│   │   │   ├── BaseEntity.java              # Base entity with common fields
│   │   │   ├── User.java                    # User entity
│   │   │   ├── ServiceProvider.java         # Service provider entity
│   │   │   ├── Service.java                 # Service entity
│   │   │   ├── Booking.java                 # Booking entity
│   │   │   ├── Rating.java                  # Rating entity
│   │   │   ├── Availability.java            # Availability entity
│   │   │   └── enums/                       # Enumerations
│   │   ├── repository/                      # Data repositories
│   │   │   └── UserRepository.java          # User repository
│   │   └── security/                        # Security components
│   │       ├── JwtUtil.java                 # JWT utility class
│   │       ├── CustomUserDetailsService.java # User details service
│   │       └── JwtAuthenticationFilter.java # JWT filter
│   └── resources/
│       └── application.properties           # Application configuration
└── test/
    ├── java/com/servicefinder/
    │   ├── ServiceFinderApplicationTests.java # Integration tests
    │   └── AuthControllerTests.java          # Authentication tests
    └── resources/
        └── application-test.properties      # Test configuration
```
## 🏗️ Project Structure - Frontend

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Application footer
│   ├── Layout.tsx       # Page layout wrapper
│   └── ProtectedRoute.tsx # Route protection
├── pages/               # Route-specific pages
│   ├── auth/           # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── customer/       # Customer-specific pages
│   │   ├── CustomerDashboard.tsx
│   │   ├── CustomerBookings.tsx
│   │   ├── CustomerRatings.tsx
│   │   └── BookingPage.tsx
│   ├── provider/       # Provider-specific pages
│   │   ├── ProviderDashboard.tsx
│   │   ├── ManageServices.tsx
│   │   ├── ProviderBookings.tsx
│   │   └── ProviderProfile.tsx
│   ├── HomePage.tsx    # Landing page
│   ├── ServicesPage.tsx # Service browsing
│   ├── ServiceDetailPage.tsx # Service details
│   ├── SearchPage.tsx  # Location-based search
│   └── NotFoundPage.tsx # 404 page
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client and endpoints
│   └── utils.ts        # Helper functions
├── store/              # Global state management
│   └── authStore.ts    # Authentication state
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Configuration

### Database Configuration

The application uses H2 in-memory database by default. Configuration can be found in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/<db-name>
spring.datasource.username=<your-db>
spring.datasource.password=<your-db-password>
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver


# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### JWT Configuration

JWT settings in `application.properties`:

```properties
# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000  # 24 hours
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**ServiceFinder Frontend** - Connecting customers with local service providers through modern web technology.

