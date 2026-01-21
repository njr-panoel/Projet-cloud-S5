# Road Issues API - Backend

## Description

REST API backend for road problem reporting and tracking in Antananarivo, Madagascar. This application allows users to report road issues with geolocation, track their status, and enables managers to manage and update signalements (reports).

## Features

- **User Authentication**: Email/password registration and login with JWT tokens
- **Authorization**: Role-based access control (USER, MANAGER)
- **Road Issue Reporting**: Create, read, update geolocation-based road issue reports
- **Status Management**: Track issue status (NOUVEAU, EN_COURS, TERMINE)
- **Action History**: Audit trail of all manager actions on signalements
- **Statistics**: Real-time application statistics (count, surface area, budget, progress)
- **Pagination**: Paginated API responses for large datasets
- **Security**: 
  - Password strength validation
  - Login attempt limiting and temporary user blocking
  - BCrypt password hashing
  - JWT token-based authentication
- **API Documentation**: Swagger/OpenAPI documentation available at `/api/swagger-ui.html`

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java**: JDK 17
- **Database**: PostgreSQL 16
- **Authentication**: JWT (JJWT)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security with BCrypt
- **Documentation**: Springdoc OpenAPI 3.0
- **Database Migration**: Flyway
- **Build Tool**: Maven 3.9
- **Testing**: JUnit 5, Mockito
- **Containerization**: Docker, Docker Compose

## Project Structure

```
road-issues-backend/
├── src/
│   ├── main/
│   │   ├── java/com/roadissues/api/
│   │   │   ├── RoadIssuesApiApplication.java
│   │   │   ├── controllers/         # REST Controllers
│   │   │   ├── services/            # Business logic
│   │   │   ├── repositories/        # Data access
│   │   │   ├── models/
│   │   │   │   ├── entities/        # JPA entities
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── security/            # JWT & security filters
│   │   │   └── exceptions/          # Custom exceptions
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/        # Flyway migrations
│   └── test/
│       └── java/com/roadissues/api/
│           └── services/            # Unit tests
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```

## Prerequisites

- Docker & Docker Compose (for containerized deployment)
- Maven 3.9+ (for manual build)
- Java 17+ (for local development)
- PostgreSQL 16+ (for direct database connection)

## Installation & Setup

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   cd road-issues-backend
   ```

2. **Build and start containers**:
   ```bash
   docker-compose up --build
   ```

3. **Verify the API is running**:
   ```bash
   curl http://localhost:8080/api/stats
   ```

4. **Access Swagger UI documentation**:
   - Open [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)

### Option 2: Manual Setup with Maven

1. **Prerequisites**:
   - Java 17 installed
   - PostgreSQL running on localhost:5432
   - Create database: `CREATE DATABASE road_issues_db;`
   - Create user: `CREATE USER road_issues_user WITH PASSWORD 'securePassword123!';`
   - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE road_issues_db TO road_issues_user;`

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Access API**: http://localhost:8080/api

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/road_issues_db
spring.datasource.username=road_issues_user
spring.datasource.password=securePassword123!

# JWT
jwt.secret=your-secret-key-change-this-in-production-at-least-32-characters-long
jwt.expiration.hours=1

# Authentication
auth.max-login-attempts=3
auth.block-duration-minutes=30
auth.password-min-length=8
auth.password-require-uppercase=true
auth.password-require-numbers=true
auth.password-require-special-chars=true
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login and get JWT token
- **GET** `/api/auth/me` - Get current user profile (protected)
- **PATCH** `/api/auth/profile` - Update user profile (protected)

### Signalements (Reports)

- **POST** `/api/signalements` - Create new report (authenticated)
- **GET** `/api/signalements` - Get all reports (public, paginated)
- **GET** `/api/signalements/{id}` - Get report details (public)
- **GET** `/api/signalements/user/my-reports` - Get user's reports (authenticated)
- **PATCH** `/api/signalements/{id}` - Update report (manager only)
- **DELETE** `/api/signalements/{id}` - Delete report (manager only)

### Statistics

- **GET** `/api/stats` - Get application statistics (public)

### Action History

- **GET** `/api/historiques/{signalementId}` - Get report history (manager only)

### Administration

- **POST** `/api/admin/unblock/{userId}` - Unblock user (manager only)

## Sample API Requests

### Register User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "SecurePass123!"
  }'
```

### Create Report (with JWT token)

```bash
curl -X POST http://localhost:8080/api/signalements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": -18.8792,
    "longitude": 47.5079,
    "description": "Nid de poule dangereux à la route d'\''Anosibe'",
    "photoUrl": "https://example.com/photo.jpg"
  }'
```

### Get Statistics

```bash
curl http://localhost:8080/api/stats
```

## Default Manager Account

After initial setup, a default manager account is created:
- **Email**: `manager@roadissues.mg`
- **Password**: Generated hash (change in production)
- **Role**: MANAGER

Use this account to login and manage reports.

## Database Schema

### Users Table
- `id` (PK)
- `nom` - Full name
- `email` (UNIQUE) - Email address
- `password_hash` - BCrypt hashed password
- `role` - USER or MANAGER
- `blocked_until` - Timestamp for login blocking
- `attempt_count` - Failed login attempts
- `firebase_uid` - Firebase authentication ID
- `created_at`, `updated_at` - Timestamps

### Signalements Table
- `id` (PK)
- `user_id` (FK) - Report creator
- `latitude`, `longitude` - Geolocation
- `description` - Issue description
- `photo_url` - Photo URL
- `statut` - NOUVEAU, EN_COURS, TERMINE
- `surface_m2` - Affected area in square meters
- `budget` - Estimated budget
- `entreprise` - Responsible company
- `deleted` - Soft delete flag
- `sync_timestamp` - For offline sync
- `date_creation`, `date_update` - Timestamps

### Historiques Table
- `id` (PK)
- `signalement_id` (FK) - Report reference
- `manager_id` (FK) - Manager who made the action
- `action` - Action description
- `details` - Additional details
- `date` - Action timestamp

## Testing

Run unit tests:

```bash
mvn test
```

### Test Coverage

- AuthService: Registration, login, password validation
- SignalementService: CRUD operations, filtering
- StatsService: Statistics calculation

## Security Considerations

1. **JWT Secret**: Change `jwt.secret` in production to a long, random string (minimum 32 characters)
2. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character
3. **Login Security**:
   - Maximum 3 failed attempts before temporary block
   - 30-minute block duration (configurable)
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Use `.env` files for sensitive data, never commit credentials

## Offline Sync (Firebase Integration)

For offline support (future implementation):
- Firebase Admin SDK is included in dependencies
- Local SQLite/PostgreSQL cache for offline
- Conflict resolution: Last-Write-Wins strategy
- Sync endpoint: `POST /api/sync`

## Logging

Logs are configured in `application.properties`:
- Application logs: DEBUG level
- Spring Security: DEBUG level
- Hibernate SQL: DEBUG level
- Root logger: INFO level

View logs:
```bash
docker-compose logs -f road-issues-api
```

## Troubleshooting

### Database Connection Error
```
Check PostgreSQL is running and credentials are correct in docker-compose.yml
```

### JWT Token Expired
```
Register/login again to get a fresh token
Token expiration: 1 hour (configurable via jwt.expiration.hours)
```

### User Blocked After Failed Logins
```
Use POST /api/admin/unblock/{userId} endpoint (manager only)
Or wait for block_duration_minutes (default 30 min)
```

### Swagger UI Not Loading
```
Verify API is running at http://localhost:8080/api/stats
Check logs: docker-compose logs road-issues-api
```

## Development

### Code Style
- Use Lombok for boilerplate reduction
- Follow Spring conventions
- Add Javadoc comments for public methods

### Adding New Endpoints
1. Create entity in `models/entities/`
2. Create repository in `repositories/`
3. Create service in `services/`
4. Create controller in `controllers/`
5. Add DTO in `models/dto/`
6. Update Swagger tags for documentation

### Database Migrations
Add new migration files to `src/main/resources/db/migration/`:
```sql
-- V2__Add_new_column.sql
ALTER TABLE signalements ADD COLUMN new_column VARCHAR(255);
```

## Contributing

1. Create a feature branch
2. Make changes with clear commit messages
3. Add unit tests for new code
4. Submit pull request

## License

MIT License - See LICENSE file

## Contact

For issues and questions:
- **Email**: contact@roadissues.mg
- **Documentation**: Swagger API docs at `/api/swagger-ui.html`

## Deployment to Production

### Pre-deployment Checklist

1. **Change Secrets**:
   ```bash
   # Generate new JWT secret (min 32 chars)
   openssl rand -base64 32
   
   # Generate new database password
   openssl rand -base64 32
   ```

2. **Update Configuration**:
   - Change `jwt.secret` in application.properties
   - Change database credentials
   - Set `spring.jpa.hibernate.ddl-auto=validate`
   - Set `logging.level.root=WARN`

3. **Docker Build**:
   ```bash
   docker build -t road-issues-api:1.0.0 -f docker/Dockerfile .
   docker tag road-issues-api:1.0.0 your-registry/road-issues-api:1.0.0
   docker push your-registry/road-issues-api:1.0.0
   ```

4. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Health Checks

```bash
# API health
curl http://localhost:8080/api/stats

# Database connection
curl http://localhost:5432 (from inside container)

# View logs
docker-compose logs -f road-issues-api
```

## Version History

- **v1.0.0** (2024-01-20): Initial release
  - User authentication with JWT
  - Road issue reporting with geolocation
  - Manager dashboard functionality
  - API documentation with Swagger
  - PostgreSQL database with Flyway migrations
  - Docker containerization
