#!/bin/bash

# Road Issues API - Test Script
# This script tests all main API endpoints

API_URL="http://localhost:8080/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Road Issues API - Test Suite ===${NC}\n"

# 1. Get Statistics (Public)
echo -e "${YELLOW}1. Testing GET /api/stats (Public)${NC}"
curl -X GET "$API_URL/stats" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# 2. Register New User
echo -e "${YELLOW}2. Testing POST /api/auth/register${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extract token for authenticated requests
USER_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.userId')

echo -e "\n${GREEN}User Token: $USER_TOKEN${NC}"
echo -e "${GREEN}User ID: $USER_ID${NC}\n"

# 3. Login
echo -e "${YELLOW}3. Testing POST /api/auth/login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo -e "${GREEN}Login Token: $LOGIN_TOKEN${NC}\n"

# 4. Get User Profile
echo -e "${YELLOW}4. Testing GET /api/auth/me (Protected)${NC}"
curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 5. Update User Profile
echo -e "${YELLOW}5. Testing PATCH /api/auth/profile (Protected)${NC}"
curl -s -X PATCH "$API_URL/auth/profile" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Updated Test User",
    "email": "testuser@example.com"
  }' | jq '.'
echo ""

# 6. Create Signalement
echo -e "${YELLOW}6. Testing POST /api/signalements (Protected)${NC}"
SIGNALEMENT_RESPONSE=$(curl -s -X POST "$API_URL/signalements" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -18.8792,
    "longitude": 47.5079,
    "description": "Large pothole on Avenue de l'\''Indépendance, Antananarivo",
    "photoUrl": "https://example.com/photo.jpg"
  }')

echo "$SIGNALEMENT_RESPONSE" | jq '.'
SIGNALEMENT_ID=$(echo "$SIGNALEMENT_RESPONSE" | jq -r '.id')
echo -e "${GREEN}Signalement ID: $SIGNALEMENT_ID${NC}\n"

# 7. Get All Signalements (Public)
echo -e "${YELLOW}7. Testing GET /api/signalements (Public)${NC}"
curl -s -X GET "$API_URL/signalements?size=10&page=0" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 8. Get Signalement by ID (Public)
echo -e "${YELLOW}8. Testing GET /api/signalements/{id} (Public)${NC}"
curl -s -X GET "$API_URL/signalements/$SIGNALEMENT_ID" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 9. Get User's Signalements
echo -e "${YELLOW}9. Testing GET /api/signalements/user/my-reports (Protected)${NC}"
curl -s -X GET "$API_URL/signalements/user/my-reports?size=10" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 10. Create Manager User for testing manager endpoints
echo -e "${YELLOW}10. Creating Manager User for Manager Tests${NC}"
MANAGER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Manager",
    "email": "testmanager@example.com",
    "password": "ManagerPass123!"
  }')

echo "$MANAGER_RESPONSE" | jq '.'
MANAGER_TOKEN=$(echo "$MANAGER_RESPONSE" | jq -r '.accessToken')
MANAGER_ID=$(echo "$MANAGER_RESPONSE" | jq -r '.userId')

echo -e "${GREEN}Manager Token: $MANAGER_TOKEN${NC}\n"

# 11. Update Signalement (Manager Only)
echo -e "${YELLOW}11. Testing PATCH /api/signalements/{id} (Manager Only)${NC}"
curl -s -X PATCH "$API_URL/signalements/$SIGNALEMENT_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "EN_COURS",
    "surfaceM2": 15.5,
    "budget": 5000,
    "entreprise": "TP Ravina"
  }' | jq '.'
echo ""

# 12. Get Historique (Manager Only)
echo -e "${YELLOW}12. Testing GET /api/historiques/{id} (Manager Only)${NC}"
curl -s -X GET "$API_URL/historiques/$SIGNALEMENT_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 13. Admin - Unblock User
echo -e "${YELLOW}13. Testing POST /api/admin/unblock/{userId} (Manager Only)${NC}"
curl -s -X POST "$API_URL/admin/unblock/$USER_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
echo ""

# 14. Get Statistics Again
echo -e "${YELLOW}14. Testing GET /api/stats After Updates (Public)${NC}"
curl -s -X GET "$API_URL/stats" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo -e "${BLUE}=== Test Suite Complete ===${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo "- User created with email: testuser@example.com"
echo "- User ID: $USER_ID"
echo "- Manager created with email: testmanager@example.com"
echo "- Manager ID: $MANAGER_ID"
echo "- Signalement created with ID: $SIGNALEMENT_ID"
echo "- Status updated to EN_COURS"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Access Swagger UI: http://localhost:8080/api/swagger-ui.html"
echo "2. Test with your own data"
echo "3. Review logs: docker-compose logs -f road-issues-api"
