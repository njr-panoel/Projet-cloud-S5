#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080"
TOKEN=""

echo "========================================="
echo "  Tests API Travaux Routiers"
echo "========================================="
echo ""

# Test 1: Inscription Manager
echo -e "${YELLOW}Test 1: Inscription Manager${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "password123",
    "nom": "Razafi",
    "prenom": "Marie",
    "role": "MANAGER"
  }')

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Inscription réussie${NC}"
else
  echo -e "${RED}✗ Échec inscription${NC}"
fi
echo ""

# Test 2: Connexion
echo -e "${YELLOW}Test 2: Connexion${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "password123"
  }')

TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Connexion réussie${NC}"
  echo "Token: ${TOKEN:0:50}..."
else
  echo -e "${RED}✗ Échec connexion${NC}"
fi
echo ""

# Test 3: Création signalement
echo -e "${YELLOW}Test 3: Création signalement${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/api/signalements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\n    \"titre\": \"Test - Nid de poule\",\n    \"description\": \"Test automatique\",\n    \"typeTravaux\": \"NIDS_DE_POULE\",\n    \"latitude\": -18.8792,\n    \"longitude\": 47.5079,\n    \"adresse\": \"Avenue de l'Indépendance\"\n  }" )

if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Signalement créé${NC}"
  SIGNALEMENT_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "ID: $SIGNALEMENT_ID"
else
  echo -e "${RED}✗ Échec création signalement${NC}"
fi
echo ""

# Test 4: Liste signalements
echo -e "${YELLOW}Test 4: Liste des signalements${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/api/signalements")

COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓ $COUNT signalement(s) trouvé(s)${NC}"
echo ""

# Test 5: Swagger UI
echo -e "${YELLOW}Test 5: Swagger UI${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/swagger-ui.html")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Swagger accessible${NC}"
  echo "URL: $API_URL/swagger-ui.html"
else
  echo -e "${RED}✗ Swagger inaccessible${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}Tests terminés !${NC}"
echo "========================================="
