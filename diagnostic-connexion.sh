#!/bin/bash

# Script de diagnostic - Connexion utilisateur

echo "=== DIAGNOSTIC CONNEXION ==="
echo ""

echo "1. Backend répond-il ?"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

echo ""
echo "2. Utilisateurs disponibles en BD :"
PGPASSWORD=postgres88 psql -h 127.0.0.1 -U postgres travaux_routiers -t -c "SELECT id, email, role, account_locked FROM users LIMIT 10;" 2>/dev/null

echo ""
echo "3. Test de connexion - test@test.com / test123 :"
curl -s http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | head -c 200

echo ""
echo ""
echo "4. Test de connexion - manager@test.com / password123 :"
curl -s http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"password123"}' | head -c 200

echo ""
