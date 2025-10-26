# ServeEase - Local Service Provider Platform

ServeEase is a comprehensive platform that connects customers with local service providers. Built with Spring Boot backend and React frontend, it offers features like service booking, rating systems, availability management, and real-time notifications.

## Features Implemented

### ✅ Core Features

- **User Management**: Registration and login for both customers and service providers
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database Schema**: Complete JPA entities for users, service providers, services, bookings, ratings, and availability
- **Security Configuration**: Spring Security setup with custom authentication filters
- **Test Data**: Sample users for testing (admin, customer, service provider)

### 🏗️ Database Schema

- **Users**: Customer and service provider profiles with location data
- **Service Providers**: Business details, verification status, ratings, trust badges
- **Services**: Service catalog with categories and pricing
- **Bookings**: Real-time booking system with status tracking
- **Ratings**: Customer reviews and ratings system
- **Availability**: Service provider availability management

## Technical Stack

- **Backend**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT authentication
- **Database**: H2 (in-memory) for development
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven
- **Java Version**: 17

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd local-service-provider-finder
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
   - H2 Console: http://localhost:8080/api/h2-console
     - JDBC URL: `jdbc:h2:mem:servicefinder`
     - Username: `sa`
     - Password: `password`

### Test Users

The application comes with pre-configured test users:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@servicefinder.com | admin123 | System administrator |
| Customer | customer@test.com | customer123 | Regular customer |
| Service Provider | provider@test.com | provider123 | Service provider |

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/validate` - Validate JWT token

### Example Login Request

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@servicefinder.com",
    "password": "admin123"
  }'
```

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "email": "admin@servicefinder.com",
  "role": "ADMIN",
  "userId": 1,
  "fullName": "Admin User"
}
```

### Using the JWT Token

Include the token in the Authorization header for protected endpoints:

```bash
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing with Swagger UI

Once the application is running, you can test all APIs using the interactive Swagger UI:

### 🚀 **How to Test Your APIs**

1. **Start the application**:
   ```bash
   mvnw.cmd spring-boot:run
   ```

2. **Open Swagger UI** in your browser:
   ```
   http://localhost:8080/api/swagger-ui.html
   ```

3. **Test the Login API**:
   - Click on **"Authentication"** section
   - Click on **"POST /auth/login"**
   - Click **"Try it out"**
   - Use the example credentials:
     ```json
     {
       "email": "admin@servicefinder.com",
       "password": "admin123"
     }
     ```
   - Click **"Execute"**
   - Copy the `token` from the response

4. **Authorize for Protected Endpoints**:
   - Click the **"Authorize"** button (🔒) at the top of Swagger UI
   - Enter: `Bearer YOUR_COPIED_TOKEN`
   - Click **"Authorize"**

5. **Test Protected Endpoints**:
   - Now you can test the `/auth/validate` endpoint
   - The JWT token will be automatically included in requests

### 📊 **Available Test Users**

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| `admin@servicefinder.com` | `admin123` | ADMIN | Full system access |
| `customer@test.com` | `customer123` | CUSTOMER | Customer features |
| `provider@test.com` | `provider123` | SERVICE_PROVIDER | Provider features |

## Project Structure

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

## Running Tests

```bash
mvn test
```

## Configuration

### Database Configuration

The application uses H2 in-memory database by default. Configuration can be found in `application.properties`:

```properties
# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:servicefinder
spring.datasource.username=sa
spring.datasource.password=password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

### JWT Configuration

JWT settings in `application.properties`:

```properties
# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000  # 24 hours
```

## Security Features

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Role-based Authorization**: Different access levels for customers, service providers, and admins
- **Password Encryption**: BCrypt password encoding
- **CORS Support**: Cross-origin resource sharing enabled
- **Input Validation**: Request validation using Bean Validation

## Future Enhancements

The current implementation provides the foundation for:

- **Service Management**: CRUD operations for services
- **Booking System**: Real-time booking and availability management
- **Rating System**: Customer reviews and provider ratings
- **Geolocation**: Location-based service provider search
- **Notification System**: Email/SMS notifications
- **Payment Integration**: Payment processing for bookings
- **File Upload**: Profile pictures and service images
- **Real-time Updates**: WebSocket support for live updates

## Development Notes

- The application uses Spring Boot's auto-configuration
- H2 console is enabled for development (disable in production)
- Test data is automatically loaded on startup
- JWT tokens are stateless and contain user information
- All timestamps use LocalDateTime for consistency

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   - Change the port in `application.properties`: `server.port=8081`

2. **JWT token errors**
   - Ensure the JWT secret is properly configured
   - Check token expiration time

3. **Database connection issues**
   - H2 is in-memory, data resets on restart
   - Check H2 console for database state

### Logs

Enable debug logging for troubleshooting:

```properties
logging.level.com.servicefinder=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License. 

## Azure App Service Deployment

### Backend (Spring Boot)
- App Service stack: Java 17, Java SE, Linux
- App Settings:
  - `SPRING_PROFILES_ACTIVE=prod`
  - `PORT=8080` (App Service sets this automatically; we also bind `${PORT}`)
  - `JWT_SECRET=your-strong-secret`
  - `CORS_ALLOWED_ORIGINS=https://<your-frontend-host>`
  - Optional DB (replace H2):
    - `DATABASE_URL=jdbc:postgresql://<host>:<port>/<db>`
    - `DATABASE_DRIVER=org.postgresql.Driver`
    - `DATABASE_USERNAME=...`
    - `DATABASE_PASSWORD=...`
    - `HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect`
    - `HIBERNATE_DDL_AUTO=update`
- Build command: `mvn -B clean package`
- Startup command: `java -jar target/serveease-backend-0.0.1-SNAPSHOT.jar`

### Frontend (Vite React)
- App Service stack: Node 18+ (Linux)
- App Settings:
  - `PORT=4173`
  - `VITE_API_URL=https://<your-backend-host>/api` (or leave unset to use relative `/api` if reverse-proxying)
- Build command: `npm ci && npm run build`
- Startup command: `npm start`

### Notes
- Backend serves API under `/api` (configured via `spring.mvc.servlet.path`).
- Frontend defaults API base to `/api` if `VITE_API_URL` is not provided.
- For a single App Service hosting both, use Azure reverse proxy or Nginx to route `/api` to backend and `/` to frontend. 