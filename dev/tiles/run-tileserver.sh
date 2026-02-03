#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "${1:-start}" in
  start)
    (cd "$DIR" && docker compose up -d)
    echo "✅ Tileserver started (http://localhost:8081/)"
    ;;
  stop)
    (cd "$DIR" && docker compose down)
    echo "✅ Tileserver stopped"
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    exit 2
    ;;
esac
