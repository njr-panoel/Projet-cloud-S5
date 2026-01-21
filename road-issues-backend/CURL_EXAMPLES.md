# Road Issues API - Curl/Postman Examples

## Base URL
```
http://localhost:8080/api
```

## 1. AUTHENTICATION ENDPOINTS

### Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "password": "SecurePass123!"
  }'
```

**Response**:
```json
{
  "userId": 1,
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "role": "USER",
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 3600000
}
```

### Login User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Update User Profile
```bash
curl -X PATCH http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont Updated",
    "email": "newemail@example.com"
  }'
```

---

## 2. SIGNALEMENT ENDPOINTS (Road Issues)

### Create New Signalement
```bash
curl -X POST http://localhost:8080/api/signalements \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -18.8792,
    "longitude": 47.5079,
    "description": "Large pothole on Avenue de l'\''Indépendance, very dangerous",
    "photoUrl": "https://example.com/photo.jpg"
  }'
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "nomUtilisateur": "Jean Dupont",
  "latitude": -18.8792,
  "longitude": 47.5079,
  "description": "Large pothole on Avenue de l'Indépendance, very dangerous",
  "photoUrl": "https://example.com/photo.jpg",
  "statut": "NOUVEAU",
  "surfaceM2": null,
  "budget": 0.0,
  "entreprise": "",
  "dateCreation": "2024-01-20T14:30:00",
  "dateUpdate": "2024-01-20T14:30:00"
}
```

### Get All Signalements (Public - No Auth Required)
```bash
curl -X GET "http://localhost:8080/api/signalements?page=0&size=20" \
  -H "Content-Type: application/json"
```

### Get All Signalements with Filters
```bash
curl -X GET "http://localhost:8080/api/signalements?statut=EN_COURS&size=10" \
  -H "Content-Type: application/json"
```

### Get Signalements by Date Range
```bash
curl -X GET "http://localhost:8080/api/signalements?dateMin=2024-01-01T00:00:00&dateMax=2024-01-31T23:59:59" \
  -H "Content-Type: application/json"
```

### Get Signalements by Company
```bash
curl -X GET "http://localhost:8080/api/signalements?entreprise=TP%20Ravina" \
  -H "Content-Type: application/json"
```

### Get Single Signalement by ID (Public - No Auth Required)
```bash
curl -X GET http://localhost:8080/api/signalements/1 \
  -H "Content-Type: application/json"
```

### Get Current User's Signalements
```bash
curl -X GET "http://localhost:8080/api/signalements/user/my-reports?page=0&size=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Update Signalement (Manager Only)
```bash
curl -X PATCH http://localhost:8080/api/signalements/1 \
  -H "Authorization: Bearer MANAGER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "EN_COURS",
    "surfaceM2": 15.5,
    "budget": 5000,
    "entreprise": "TP Ravina"
  }'
```

### Delete Signalement (Manager Only - Soft Delete)
```bash
curl -X DELETE http://localhost:8080/api/signalements/1 \
  -H "Authorization: Bearer MANAGER_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 3. STATISTICS ENDPOINTS

### Get Application Statistics (Public - No Auth Required)
```bash
curl -X GET http://localhost:8080/api/stats \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "nbPoints": 25,
  "totalSurfaceM2": 385.5,
  "avancementPercent": 48.0,
  "totalBudget": 125000.0,
  "nbNouveau": 8,
  "nbEnCours": 5,
  "nbTermine": 12
}
```

---

## 4. ACTION HISTORY ENDPOINTS

### Get Historique for Signalement (Manager Only)
```bash
curl -X GET http://localhost:8080/api/historiques/1 \
  -H "Authorization: Bearer MANAGER_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Response**:
```json
[
  {
    "id": 1,
    "signalementId": 1,
    "managerId": 2,
    "managerNom": "Test Manager",
    "action": "Status updated",
    "details": "Status: EN_COURS, Surface: 15.5",
    "date": "2024-01-20T15:45:00"
  }
]
```

---

## 5. ADMIN ENDPOINTS

### Unblock User (Manager Only)
```bash
curl -X POST http://localhost:8080/api/admin/unblock/1 \
  -H "Authorization: Bearer MANAGER_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## ERROR RESPONSES

### Invalid Email Format
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John",
    "email": "invalid-email",
    "password": "SecurePass123!"
  }'
```

**Response (400 Bad Request)**:
```json
{
  "status": 400,
  "message": "Invalid email format",
  "error": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T14:30:00",
  "path": "/api/auth/register"
}
```

### User Blocked (Too Many Failed Attempts)
```json
{
  "status": 423,
  "message": "User is blocked. Try again after 2024-01-20T15:15:00",
  "error": "USER_BLOCKED",
  "timestamp": "2024-01-20T14:30:00",
  "path": "/api/auth/login"
}
```

### Unauthorized (Invalid Token)
```json
{
  "status": 401,
  "message": "Unauthorized",
  "error": "UNAUTHORIZED",
  "timestamp": "2024-01-20T14:30:00",
  "path": "/api/signalements"
}
```

### Resource Not Found
```json
{
  "status": 404,
  "message": "Signalement not found",
  "error": "NOT_FOUND",
  "timestamp": "2024-01-20T14:30:00",
  "path": "/api/signalements/999"
}
```

### Forbidden (Manager Only Endpoint)
```json
{
  "status": 403,
  "message": "Only managers can update signalements",
  "error": "FORBIDDEN",
  "timestamp": "2024-01-20T14:30:00",
  "path": "/api/signalements/1"
}
```

---

## BATCH OPERATIONS EXAMPLES

### Create Multiple Signalements (Loop in Bash)
```bash
#!/bin/bash

TOKEN="YOUR_ACCESS_TOKEN_HERE"
BASE_URL="http://localhost:8080/api"

# Create 5 signalements at different locations
for i in {1..5}; do
  LAT="-18.$((8700 + i * 100))"
  LNG="47.$((5000 + i * 100))"
  
  curl -X POST "$BASE_URL/signalements" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"latitude\": $LAT,
      \"longitude\": $LNG,
      \"description\": \"Issue #$i in Antananarivo\",
      \"photoUrl\": \"https://example.com/photo$i.jpg\"
    }"
  
  echo "Created signalement #$i"
  sleep 1
done
```

### Get All Signalements and Parse with jq
```bash
curl -X GET "http://localhost:8080/api/signalements?size=100" \
  -H "Content-Type: application/json" | jq '.content[] | {id, description, statut}'
```

---

## POSTMAN COLLECTION

Import this into Postman:

```json
{
  "info": {
    "name": "Road Issues API",
    "description": "Collection for Road Issues API endpoints"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login"
          }
        }
      ]
    },
    {
      "name": "Signalements",
      "item": [
        {
          "name": "Create",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/signalements"
          }
        },
        {
          "name": "Get All",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/signalements"
          }
        }
      ]
    }
  ]
}
```

---

## ENVIRONMENT VARIABLES FOR SCRIPTING

```bash
# Save token from login response
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.accessToken')

# Use token in subsequent requests
curl -X GET http://localhost:8080/api/signalements/user/my-reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## TESTING PASSWORD VALIDATION

### Too Short (< 8 characters)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "password": "Short1!"
  }'
```

### Missing Uppercase
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "password": "lowercase123!"
  }'
```

### Missing Number
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "password": "NoNumbers!"
  }'
```

### Missing Special Character
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "password": "NoSpecial123"
  }'
```

### Valid Password
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "password": "ValidPass123!"
  }'
```

---

## TESTING WITH HTTPIE (Alternative to curl)

Install httpie: `pip install httpie`

### Register with httpie
```bash
http POST http://localhost:8080/api/auth/register \
  nom="Jean" \
  email="jean@example.com" \
  password="SecurePass123!"
```

### Get with Bearer Token
```bash
http GET http://localhost:8080/api/auth/me \
  "Authorization: Bearer YOUR_TOKEN"
```

---

## PERFORMANCE TESTING

### Load Test with Apache Bench
```bash
# Create 1000 GET requests to stats endpoint
ab -n 1000 -c 10 http://localhost:8080/api/stats
```

### Load Test with wrk
```bash
wrk -t4 -c100 -d30s http://localhost:8080/api/stats
```

---

For more information, see:
- README.md - API documentation
- INSTALL.md - Installation guide
- Swagger UI - http://localhost:8080/api/swagger-ui.html
