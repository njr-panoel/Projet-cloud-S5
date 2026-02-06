#!/bin/bash

echo "🔧 Setup - Création d'un compte Manager fonctionnel"
echo "=================================================="
echo ""

# Créer un nouveau compte manager
echo "Création du compte manager..."
cat > /tmp/setup_manager.sql << 'SQLEOF'
-- Supprimer les anciens comptes de test
DELETE FROM users WHERE email IN ('manager_real@test.com', 'admin_real@test.com');

-- Créer un nouveau manager FRAIS
INSERT INTO users (
  email, nom, prenom, role, auth_provider, 
  active, account_locked, login_attempts, password, created_at
) VALUES (
  'manager_real@test.com',
  'Manager',
  'Real',
  'MANAGER',
  'LOCAL',
  true,
  false,
  0,
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCJzT5qpK',
  NOW()
);

-- Vérifier la création
SELECT id, email, role, account_locked, login_attempts FROM users WHERE email='manager_real@test.com';
SQLEOF

# Exécuter avec PGPASSWORD
export PGPASSWORD=postgres88
psql -h 127.0.0.1 -U postgres -d travaux_routiers -f /tmp/setup_manager.sql

echo ""
echo "✅ Compte créé!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "IDENTIFIANTS DE CONNEXION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Email:        manager_real@test.com"
echo "Mot de passe: password123"
echo "Rôle:         MANAGER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Test de connexion..."
curl -s http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"manager_real@test.com","password":"password123"}' | grep -o '"success":true\|"success":false' || echo "Pas de réponse du backend"

echo ""
echo "✨ Setup terminé!"
