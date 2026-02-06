#!/bin/bash
# Créer un compte manager fonctionnel pour les tests

echo "Création d'un compte manager de test..."

# Hash BCrypt pour le mot de passe "manager123"
# Généré avec: echo 'manager123' | htpasswd -iBCsalt '' 2>/dev/null | cut -d'$' -f4-
HASH='$2a$10$ykkLiMA8VZB6e7N5nL9mPeHKLsVW0dVNvKLz8pjlmMxwS97cq7Bpq'

cat > /tmp/create_manager.sql << SQL
-- Créer un manager de test frais
DELETE FROM users WHERE email='manager_test@test.com';

INSERT INTO users (
  email, 
  nom, 
  prenom, 
  role, 
  auth_provider, 
  active, 
  account_locked, 
  login_attempts, 
  password,
  created_at
) VALUES (
  'manager_test@test.com',
  'Manager',
  'Test',
  'MANAGER',
  'LOCAL',
  true,
  false,
  0,
  '$2a$10$ykkLiMA8VZB6e7N5nL9mPeHKLsVW0dVNvKLz8pjlmMxwS97cq7Bpq',
  NOW()
);

-- Vérifier la création
SELECT id, email, role, password FROM users WHERE email='manager_test@test.com';
SQL

echo "Exécution du script SQL..."
PGPASSWORD=postgres88 psql -h 127.0.0.1 -U postgres travaux_routiers -f /tmp/create_manager.sql

echo ""
echo "✅ Manager créé!"
echo ""
echo "Identifiants de connexion :"
echo "  Email: manager_test@test.com"
echo "  Mot de passe: manager123"
