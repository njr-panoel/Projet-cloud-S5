# Project Structure Guide

## Overview

This is a complete Spring Boot REST API backend for road issue reporting and tracking.

```
road-issues-backend/
├── src/
│   ├── main/
│   │   ├── java/com/roadissues/api/
│   │   │   ├── RoadIssuesApiApplication.java          # Main Spring Boot entry point
│   │   │   │
│   │   │   ├── controllers/                            # REST API Controllers
│   │   │   │   ├── AuthController.java                # Authentication endpoints
│   │   │   │   ├── SignalementController.java         # Road issue endpoints
│   │   │   │   ├── StatsController.java               # Statistics endpoints
│   │   │   │   ├── HistoriqueController.java          # Action history endpoints
│   │   │   │   └── AdminController.java               # Admin endpoints
│   │   │   │
│   │   │   ├── services/                              # Business Logic Layer
│   │   │   │   ├── AuthService.java                   # Authentication logic
│   │   │   │   ├── SignalementService.java            # Signalement CRUD & logic
│   │   │   │   ├── StatsService.java                  # Statistics calculations
│   │   │   │   └── HistoriqueService.java             # Action logging
│   │   │   │
│   │   │   ├── repositories/                          # Data Access Layer
│   │   │   │   ├── UserRepository.java                # User CRUD operations
│   │   │   │   ├── SignalementRepository.java         # Signalement queries
│   │   │   │   └── HistoriqueRepository.java          # Historique queries
│   │   │   │
│   │   │   ├── models/                                # Data Models
│   │   │   │   ├── entities/                          # JPA Entities
│   │   │   │   │   ├── User.java                     # User entity (JPA)
│   │   │   │   │   ├── Signalement.java              # Road issue entity
│   │   │   │   │   └── Historique.java               # Action history entity
│   │   │   │   │
│   │   │   │   └── dto/                               # Data Transfer Objects
│   │   │   │       ├── AuthDtos.java                 # Auth request/response DTOs
│   │   │   │       ├── SignalementDtos.java          # Signalement DTOs
│   │   │   │       ├── GeneralDtos.java              # Stats & Sync DTOs
│   │   │   │       ├── HistoriqueDtos.java           # History DTOs
│   │   │   │       └── DtosExport.java               # DTO export classes
│   │   │   │
│   │   │   ├── config/                                # Configuration Classes
│   │   │   │   ├── JwtTokenProvider.java             # JWT token generation/validation
│   │   │   │   ├── SecurityConfig.java               # Spring Security configuration
│   │   │   │   └── SwaggerConfig.java                # OpenAPI/Swagger configuration
│   │   │   │
│   │   │   ├── security/                              # Security Components
│   │   │   │   ├── JwtAuthenticationFilter.java      # JWT extraction & validation filter
│   │   │   │   └── JwtAuthenticationProvider.java    # JWT authentication provider
│   │   │   │
│   │   │   └── exceptions/                            # Exception Handling
│   │   │       ├── CustomExceptions.java             # Custom exception classes
│   │   │       ├── ErrorResponse.java                # Standardized error response
│   │   │       └── GlobalExceptionHandler.java       # @ControllerAdvice for error handling
│   │   │
│   │   └── resources/
│   │       ├── application.properties                # Application configuration
│   │       ├── application.yml                       # Alternative YAML config
│   │       ├── firebase-config.json                  # Firebase service account (template)
│   │       └── db/migration/
│   │           └── V1__Initial_schema.sql           # Flyway database migration
│   │
│   └── test/
│       └── java/com/roadissues/api/
│           └── services/
│               └── AuthServiceTest.java             # Unit tests for AuthService
│
├── docker/
│   └── Dockerfile                                    # Multi-stage Docker build
│
├── .gitignore                                        # Git ignore rules
├── docker-compose.yml                                # Docker Compose configuration
├── pom.xml                                           # Maven project configuration
├── README.md                                         # Main documentation
├── INSTALL.md                                        # Installation guide
├── test-api.sh                                       # API testing script
└── PROJECT_STRUCTURE.md                             # This file

```

## Component Descriptions

### Core Layers

#### 1. Controllers (Presentation Layer)
- **AuthController**: Handles user registration, login, profile management
- **SignalementController**: CRUD operations for road issues
- **StatsController**: Provides application statistics
- **HistoriqueController**: Retrieves action history (manager only)
- **AdminController**: Administrative functions (manager only)

**Request Flow**: HTTP Request → Controller → Service → Repository → Database

#### 2. Services (Business Logic Layer)
- **AuthService**: Password validation, user registration, login with attempt limiting
- **SignalementService**: Create, read, update road issues with filtering
- **StatsService**: Calculate statistics (counts, surface area, progress %)
- **HistoriqueService**: Log and retrieve action history

**Key Features**:
- Password strength validation (regex patterns)
- Login attempt limiting and temporary blocking
- Pagination support
- Filtering and sorting

#### 3. Repositories (Data Access Layer)
- Extends `JpaRepository` for automatic CRUD operations
- Custom query methods for filtering and statistics
- Database interaction abstraction

#### 4. Models

**Entities** (JPA - Database Representation):
- `User`: Represents system users with roles and authentication info
- `Signalement`: Represents road issues with geolocation and status
- `Historique`: Audit trail of manager actions on issues

**DTOs** (Transfer Objects):
- Request DTOs: For receiving data from clients
- Response DTOs: For sending data to clients
- Separate from entities for API versioning and flexibility

#### 5. Configuration
- **JwtTokenProvider**: Generates, validates, and extracts data from JWT tokens
- **SecurityConfig**: Spring Security configuration with JWT filter chain
- **SwaggerConfig**: OpenAPI 3.0 documentation configuration

#### 6. Security
- **JwtAuthenticationFilter**: Intercepts requests, extracts and validates JWT tokens
- **JwtAuthenticationProvider**: Authenticates users based on JWT claims
- Password hashing with BCrypt
- Role-based access control (USER, MANAGER)

#### 7. Exception Handling
- Custom exceptions for different error scenarios
- Global exception handler with standardized error responses
- HTTP status codes mapped to exception types

### Database Layer

#### Entities Relationships
```
User (1) ──── (N) Signalement
       │
       └── Manager (1) ──── (N) Historique
                              │
                              └── References (N) Signalement
```

#### Key Tables
1. **users**: User accounts and authentication
2. **signalements**: Road issue reports
3. **historiques**: Action audit trail

### Configuration & Properties

#### application.properties
- Database connection settings
- JWT configuration (secret, expiration)
- Authentication settings (max attempts, block duration)
- Firebase configuration path
- Logging levels
- File upload settings

#### docker-compose.yml
- PostgreSQL service definition
- Spring Boot API service definition
- Volume management
- Network configuration
- Health checks

## Data Flow Example

### User Registration Flow
```
POST /api/auth/register
    ↓
AuthController.register()
    ↓
AuthService.register()
    ├── Validate password strength
    ├── Validate email format
    └── User not already exists
    ↓
PasswordEncoder.encode()
    ↓
UserRepository.save()
    ↓
Database INSERT users
    ↓
JwtTokenProvider.generateToken()
    ↓
AuthResponse (with JWT token)
    ↓
HTTP 201 Created
```

### Create Signalement Flow
```
POST /api/signalements (with Bearer token)
    ↓
JwtAuthenticationFilter (extract token)
    ↓
JwtTokenProvider.validateToken() & getInfo()
    ↓
SecurityContext set authentication
    ↓
SignalementController.createSignalement()
    ↓
SignalementService.createSignalement()
    ├── Get user from database
    ├── Validate coordinates
    └── Set default status: NOUVEAU
    ↓
SignalementRepository.save()
    ↓
Database INSERT signalements
    ↓
SignalementDto response
    ↓
HTTP 201 Created
```

## Test Coverage

### Unit Tests
- AuthService: Registration, login, password validation
- Utilizes Mockito for mocking dependencies
- JUnit 5 for test execution

### Integration Tests (Can be added)
- End-to-end API testing
- Database transaction testing
- Controller integration

### Manual Testing
- test-api.sh: Bash script testing all endpoints
- Swagger UI: Interactive API testing

## Security Architecture

### Authentication Flow
```
Client Login
    ↓
POST /api/auth/login
    ↓
AuthService validates credentials
    ↓
JwtTokenProvider generates token
    ↓
Client receives JWT token
    ↓
Client includes in Authorization: Bearer <token>
    ↓
JwtAuthenticationFilter extracts token
    ↓
Token validation & claims extraction
    ↓
User authority set in SecurityContext
    ↓
Controller method execution
```

### Authorization
- Roles: USER, MANAGER
- Route-based access control via SecurityConfig
- Manager-only endpoints checked via JWT role claim

## Extension Points

### Adding New Endpoints
1. Create Entity in `models/entities/`
2. Create Repository extending JpaRepository
3. Create Service with business logic
4. Create DTOs in `models/dto/`
5. Create Controller with @RestController
6. Add Swagger @Operation annotations
7. Update SecurityConfig for route protection
8. Add database migration in `db/migration/`

### Adding New Features
- Add Firebase integration: Implement in AuthService
- Add file upload: Enhance SignalementController
- Add email notifications: Create NotificationService
- Add offline sync: Implement SyncService

## Performance Considerations

### Database Optimization
- Indexed columns: email, role, statut, date_creation, coordinates
- JPA batch processing configured
- Pagination support for large result sets
- Connection pooling via HikariCP

### Caching Opportunities
- Stats could be cached with TTL
- User profile caching
- SignalementStatus enum caching

### Scaling Considerations
- Stateless API (JWT-based)
- Horizontal scaling compatible
- Read replicas for statistics
- Async processing for heavy operations

## Development Workflow

### Local Development
1. Clone repository
2. Configure database in application.properties
3. Run `mvn clean install`
4. Run `mvn spring-boot:run`
5. Access http://localhost:8080/api

### Docker Development
1. Run `docker-compose up --build`
2. Database migrations run automatically
3. Logs: `docker-compose logs -f road-issues-api`

### Version Control
- .gitignore configured for Java/Maven/IDE files
- Sensitive data not committed (use .env files)

## Documentation

- **README.md**: Full feature documentation and API guide
- **INSTALL.md**: Installation and setup instructions
- **Swagger UI**: Interactive API documentation at `/api/swagger-ui.html`
- **Javadoc**: Comments on public methods and classes

## Dependencies

### Core Framework
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security
- Spring Web

### Database
- PostgreSQL JDBC driver
- Hibernate ORM
- Flyway migrations

### Authentication
- JJWT (JSON Web Tokens)
- BCrypt password encoder

### Documentation
- Springdoc OpenAPI 3.0

### Testing
- JUnit 5
- Mockito
- Spring Security Test

### Build
- Maven
- Docker
- Docker Compose

## Future Enhancements

1. **Firebase Integration**: Real Firebase auth and sync
2. **Real-time Sync**: WebSocket for live updates
3. **File Upload**: Cloudinary or S3 integration
4. **Email Notifications**: SendGrid integration
5. **Map Visualization**: Backend support for maps
6. **Analytics**: Usage statistics and reporting
7. **Rate Limiting**: API request throttling
8. **Caching**: Redis caching layer
9. **Monitoring**: Prometheus metrics
10. **Audit Logging**: Extended audit trail

---

For detailed instructions on running and testing the API, see [INSTALL.md](INSTALL.md) and [README.md](README.md).
