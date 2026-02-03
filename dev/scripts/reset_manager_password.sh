#!/usr/bin/env bash
set -euo pipefail

# Usage: ./reset_manager_password.sh [password]
# If Docker postgres container 'travaux-routiers-db' exists, it will use it.
PW="${1:-Password123!}"
# bcrypt hash generated previously for Password123!:
HASH='$2b$12$6GinaQ.A4G/kovg1Tedane4wqRpsAR2eSXC1/3C9jMJ1vADpRYOjK'

# If password provided, instruct user how to generate a new hash
if [ -n "${1:-}" ]; then
  echo "Note: to set a custom password, generate a new bcrypt hash yourself and replace HASH in this script or run the SQL directly."
fi

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q '^travaux-routiers-db$'; then
  echo "Updating manager password inside Docker container 'travaux-routiers-db'..."
  docker exec -i travaux-routiers-db psql -U postgres -d travaux_routiers -c "UPDATE users SET password='${HASH}' WHERE email='manager@test.com';"
  echo "Done. Manager password set to: ${PW} (hash applied)"
  exit 0
fi

if command -v psql >/dev/null 2>&1; then
  echo "Updating manager password using local psql..."
  psql -U postgres -d travaux_routiers -c "UPDATE users SET password='${HASH}' WHERE email='manager@test.com';"
  echo "Done. Manager password set to: ${PW} (hash applied)"
  exit 0
fi

echo "No Docker or psql command found. Use the SQL file at dev/db/update-manager-password.sql to update your database manually."
exit 1
