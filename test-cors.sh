#!/bin/bash

echo "Test CORS - Connexion Manager"
echo "============================="
echo ""

# Attendre que le backend redémarre
sleep 3

echo "1. Test de l'endpoint login avec CORS :"
curl -v http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:1573" \
  -d '{"email":"manager@test.com","password":"password123"}' 2>&1 | grep -E "Access-Control|success|message"

echo ""
echo "2. Vérifier les comptes disponibles :"
echo "SELECT email, role FROM users LIMIT 5;" | PGPASSWORD=postgres88 psql -h 127.0.0.1 -U postgres travaux_routiers

echo ""
echo "✅ Test CORS terminé"
