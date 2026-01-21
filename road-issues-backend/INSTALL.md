# Installation Guide - Road Issues API

## Quick Start (Docker Compose - Recommended)

### Prerequisites
- Docker: https://docs.docker.com/get-docker/
- Docker Compose: https://docs.docker.com/compose/install/

### Steps

1. **Navigate to project directory**:
   ```bash
   cd road-issues-backend
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Spring Boot application image
   - Start PostgreSQL database container
   - Start the API container
   - Run database migrations automatically
   - Create default manager user

3. **Verify installation**:
   ```bash
   # Check if API is responding
   curl http://localhost:8080/api/stats
   ```

   Expected response:
   ```json
   {
     "nbPoints": 0,
     "totalSurfaceM2": 0.0,
     "avancementPercent": 0.0,
     "totalBudget": 0.0,
     "nbNouveau": 0,
     "nbEnCours": 0,
     "nbTermine": 0
   }
   ```

4. **Access Swagger Documentation**:
   - Open browser: http://localhost:8080/api/swagger-ui.html
   - All API endpoints are documented with request/response examples

5. **Stop the application**:
   ```bash
   docker-compose down
   ```

   To remove volumes (database):
   ```bash
   docker-compose down -v
   ```

---

## Manual Installation (Local Development)

### Prerequisites
- Java Development Kit (JDK) 17+: https://www.oracle.com/java/technologies/downloads/
- Maven 3.9+: https://maven.apache.org/install.html
- PostgreSQL 16+: https://www.postgresql.org/download/
- Git: https://git-scm.com/

### Database Setup

1. **Connect to PostgreSQL**:
   ```bash
   psql -U postgres
   ```

2. **Create database and user**:
   ```sql
   CREATE DATABASE road_issues_db;
   CREATE USER road_issues_user WITH PASSWORD 'securePassword123!';
   ALTER ROLE road_issues_user SET client_encoding TO 'utf8';
   ALTER ROLE road_issues_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE road_issues_user SET default_transaction_deferrable TO on;
   ALTER ROLE road_issues_user SET default_time_zone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE road_issues_db TO road_issues_user;
   \q
   ```

### Application Setup

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd road-issues-backend
   ```

2. **Build project**:
   ```bash
   mvn clean install
   ```

3. **Run application**:
   ```bash
   mvn spring-boot:run
   ```

   Or run the compiled JAR:
   ```bash
   java -jar target/road-issues-api-1.0.0.jar
   ```

4. **Verify application is running**:
   ```bash
   curl http://localhost:8080/api/stats
   ```

5. **Access API documentation**:
   - http://localhost:8080/api/swagger-ui.html

---

## Configuration

### Change JWT Secret (Important for Production)

1. Generate a new secret:
   ```bash
   # Linux/macOS
   openssl rand -base64 32
   
   # Windows PowerShell
   [Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
   ```

2. Update `application.properties`:
   ```properties
   jwt.secret=your-new-secret-key-here-at-least-32-chars
   ```

### Customize Authentication Settings

Edit `application.properties`:

```properties
# Maximum failed login attempts before blocking
auth.max-login-attempts=3

# Block duration in minutes
auth.block-duration-minutes=30

# Password requirements
auth.password-min-length=8
auth.password-require-uppercase=true
auth.password-require-numbers=true
auth.password-require-special-chars=true
```

### Database Configuration

For different database, edit `application.properties`:

```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/road_issues_db
spring.datasource.username=road_issues_user
spring.datasource.password=securePassword123!
```

---

## Testing

### Run Unit Tests

```bash
mvn test
```

### Using Postman / curl

1. **Get statistics** (no auth required):
   ```bash
   curl -X GET http://localhost:8080/api/stats
   ```

2. **Register new user**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "nom": "Test User",
       "email": "testuser@example.com",
       "password": "SecurePass123!"
     }'
   ```

3. **Login**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@example.com",
       "password": "SecurePass123!"
     }'
   ```

   Save the `accessToken` from response.

4. **Create signalement** (requires token):
   ```bash
   curl -X POST http://localhost:8080/api/signalements \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
     -d '{
       "latitude": -18.8792,
       "longitude": 47.5079,
       "description": "Large pothole on Avenue de l'\''Indépendance",
       "photoUrl": "https://example.com/photo.jpg"
     }'
   ```

5. **Get all signalements** (no auth required):
   ```bash
   curl -X GET "http://localhost:8080/api/signalements?statut=NOUVEAU&size=10"
   ```

---

## Docker Commands

### Build Docker image manually

```bash
docker build -t road-issues-api:1.0.0 -f docker/Dockerfile .
```

### Run with Docker (without Compose)

```bash
# Start PostgreSQL
docker run -d \
  --name road-issues-postgres \
  -e POSTGRES_DB=road_issues_db \
  -e POSTGRES_USER=road_issues_user \
  -e POSTGRES_PASSWORD=securePassword123! \
  -p 5432:5432 \
  postgres:16-alpine

# Run API
docker run -d \
  --name road-issues-api \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://road-issues-postgres:5432/road_issues_db \
  road-issues-api:1.0.0
```

### View logs

```bash
# Docker Compose
docker-compose logs -f road-issues-api

# Docker
docker logs -f road-issues-api
```

### Stop containers

```bash
# Docker Compose
docker-compose stop

# Docker
docker stop road-issues-api road-issues-postgres
```

---

## Troubleshooting

### Issue: Connection refused on port 8080
**Solution**: Check if port 8080 is already in use
```bash
# Linux/macOS
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

### Issue: PostgreSQL connection error
**Solution**: Verify credentials and database exists
```bash
psql -U road_issues_user -d road_issues_db -h localhost
```

### Issue: JWT token expired
**Solution**: Login again to get a fresh token
- Token valid for 1 hour (configurable via `jwt.expiration.hours`)

### Issue: User blocked after failed logins
**Solution**: Either:
1. Wait 30 minutes for auto-unblock (configurable)
2. Use manager account to call: `POST /api/admin/unblock/{userId}`

### Issue: Database migration failed
**Solution**: Check Flyway migration logs
```bash
docker-compose logs road-issues-postgres
```

---

## Default Manager Account

After setup, a default manager is created:

- **Email**: `manager@roadissues.mg`
- **Password**: Needs to be set in production (change in SQL migration)
- **Role**: MANAGER

### Create custom manager account

Use Swagger UI or:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "New Manager",
    "email": "newmanager@example.com",
    "password": "SecurePass123!"
  }'
```

Then update role in database (manager-only action needed):
```sql
UPDATE users SET role = 'MANAGER' WHERE email = 'newmanager@example.com';
```

---

## Performance Tuning

### Increase database pool size

Edit `application.properties`:
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
```

### Disable SQL logging in production

Edit `application.properties`:
```properties
logging.level.org.hibernate.SQL=INFO
```

---

## Backup & Recovery

### Backup PostgreSQL database

```bash
# Using Docker
docker exec road-issues-postgres pg_dump -U road_issues_user road_issues_db > backup.sql

# Direct connection
pg_dump -U road_issues_user -h localhost road_issues_db > backup.sql
```

### Restore from backup

```bash
# Using Docker
docker exec -i road-issues-postgres psql -U road_issues_user road_issues_db < backup.sql

# Direct connection
psql -U road_issues_user -h localhost road_issues_db < backup.sql
```

---

## Next Steps

1. **Access Swagger UI**: http://localhost:8080/api/swagger-ui.html
2. **Review API endpoints**: See README.md for endpoint documentation
3. **Test endpoints**: Use provided curl examples
4. **Deploy to production**: See deployment section in README.md

---

## Support

For issues:
1. Check logs: `docker-compose logs road-issues-api`
2. Review README.md for more information
3. Check configuration in application.properties
4. Verify database connectivity
