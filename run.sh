#!/usr/bin/env bash
set -euo pipefail

# run.sh — Script d'aide pour builder / démarrer le projet
# Usage: ./run.sh [action]
# Actions: help | build-backend | run-backend | build-web | run-web | build-mobile | run-mobile | docker-up | docker-down | start | stop | all

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_DIR="$DIR/dev"
WEB_DIR="$DIR/web-app"
MOBILE_DIR="$DEV_DIR/mobile-ionic-app"

usage() {
  cat <<'EOF'
Usage: ./run.sh [action]
Actions:
  help            Affiche cette aide
  build-backend   Compile le backend (Maven) (skip tests)
  run-backend     Lance le backend localement (mvn spring-boot:run)
  build-web       Installe les dépendances et build le web (web-app)
  run-web         Installe les dépendances et lance le serveur dev du web (vite)
  build-mobile    Installe les dépendances et build l'app mobile (Ionic/Vite)
  run-mobile      Lance le serveur dev mobile (vite)
  docker-up       Lance les services Docker (docker compose up -d) depuis le dossier dev
  docker-down     Arrête et supprime les services Docker (docker compose down -v)
  start           Démarre le projet (si docker disponible: docker-up, sinon build & run local)
  start-all       Démarre le backend en arrière-plan et le front en dev (local; si Docker disponible, utilise docker + run-web)
  stop            stoppe (docker-down si docker disponible)
  stop-all        Arrête le backend/local ou les containers Docker (s'il ont été démarrés avec start-all)
  all             Exécute build-backend, build-web, build-mobile

Exemples:
  ./run.sh start
  ./run.sh build-backend
  ./run.sh run-web
EOF
}

# helpers
_cmd() {
  if command -v "$1" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

mvn_cmd() {
  if [ -x "$DEV_DIR/mvnw" ]; then
    echo "$DEV_DIR/mvnw"
  elif _cmd mvn; then
    echo mvn
  else
    echo ""  # empty => not found
  fi
}

npm_install() {
  # prefer npm ci when lockfile exists
  if [ -f "$1/package-lock.json" ]; then
    (cd "$1" && npm ci)
  else
    (cd "$1" && npm install)
  fi
}

# actions
build_backend() {
  echo "➡️  Building backend (skip tests)..."
  local mvn
  mvn=$(mvn_cmd)
  if [ -z "$mvn" ]; then
    echo "Erreur: Maven non trouvé. Installez Maven ou utilisez le wrapper 'mvnw' dans $DEV_DIR." >&2
    exit 1
  fi
  (cd "$DEV_DIR" && "$mvn" -DskipTests package)
  echo "✅ Backend construit: $DEV_DIR/target"
}

run_backend() {
  echo "➡️  Lancement backend..."
  local mvn
  mvn=$(mvn_cmd)
  if [ -z "$mvn" ]; then
    echo "Erreur: Maven non trouvé. Installez Maven ou utilisez le wrapper 'mvnw' dans $DEV_DIR." >&2
    exit 1
  fi
  (cd "$DEV_DIR" && "$mvn" spring-boot:run)
}

build_web() {
  echo "➡️  Building web-app..."
  npm_install "$WEB_DIR"
  (cd "$WEB_DIR" && npm run build)
  echo "✅ web-app build: $WEB_DIR/dist"
}

run_web() {
  echo "➡️  Lancement web-app (dev)..."
  npm_install "$WEB_DIR"
  (cd "$WEB_DIR" && npm run dev)
}

build_mobile() {
  echo "➡️  Building mobile (Ionic/Vite)..."
  npm_install "$MOBILE_DIR"
  (cd "$MOBILE_DIR" && npm run build)
  echo "✅ Mobile build: $MOBILE_DIR/dist"
}

run_mobile() {
  echo "➡️  Lancement mobile (dev)..."
  npm_install "$MOBILE_DIR"
  (cd "$MOBILE_DIR" && npm run dev)
}

docker_up() {
  if _cmd docker; then
    echo "➡️  Démarrage via Docker Compose (dev/docker-compose.yml)..."
    (cd "$DEV_DIR" && docker compose up -d --build)
    echo "✅ Docker containers démarrés"
  else
    echo "Docker non trouvé. Installez Docker pour utiliser cette option." >&2
    exit 1
  fi
}

docker_down() {
  if _cmd docker; then
    echo "➡️  Arrêt des containers Docker..."
    (cd "$DEV_DIR" && docker compose down -v)
    echo "✅ Docker containers arrêtés"
  else
    echo "Docker non trouvé. Rien à faire." >&2
  fi
}

start_both_local() {
  # Build then run backend in background and web in foreground
  echo "➡️ Construction du backend..."
  build_backend
  local mvn
  mvn=$(mvn_cmd)
  if [ -z "$mvn" ]; then
    echo "Erreur: Maven non trouvé. Installez Maven ou utilisez le wrapper 'mvnw' dans $DEV_DIR." >&2
    exit 1
  fi
  echo "➡️ Lancement du backend en arrière-plan (logs: $DEV_DIR/backend.log, PID: $DEV_DIR/backend.pid)..."
  (cd "$DEV_DIR" && nohup "$mvn" spring-boot:run > backend.log 2>&1 & echo $! > backend.pid)
  echo "✅ Backend lancé (PID $(cat \"$DEV_DIR/backend.pid\"))"
  echo "➡️ Lancement du front (dev) en avant-plan..."
  run_web
}

stop_all_local() {
  if [ -f "$DEV_DIR/backend.pid" ]; then
    pid=$(cat "$DEV_DIR/backend.pid") || pid=""
    if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
      echo "➡️ Arrêt du backend (PID $pid)..."
      kill "$pid" || true
      rm -f "$DEV_DIR/backend.pid"
      echo "✅ Backend arrêté"
    else
      echo "ℹ️ PID non valide ou processus déjà terminé. Suppression du fichier PID si présent."
      rm -f "$DEV_DIR/backend.pid" 2>/dev/null || true
    fi
  else
    echo "ℹ️ Aucun PID backend trouvé."
  fi
  echo "Si le web est en avant-plan dans ce terminal, utilisez Ctrl+C pour l'arrêter."
} 

# main
if [ "$#" -eq 0 ]; then
  ACTION=help
else
  ACTION="$1"
fi

case "$ACTION" in
  help) usage ;;
  build-backend) build_backend ;;
  run-backend) run_backend ;;
  build-web) build_web ;;
  run-web) run_web ;;
  build-mobile) build_mobile ;;
  run-mobile) run_mobile ;;
  docker-up) docker_up ;;
  docker-down) docker_down ;;
  start)
    if _cmd docker && [ -f "$DEV_DIR/docker-compose.yml" ]; then
      docker_up
      echo "✅ Projet démarré via Docker (backend + postgres). Pour le web: lancez 'run-web' ou build 'build-web' si nécessaire."
    else
      echo "Docker non disponible -> démarrage local"
      start_both_local
    fi
    ;;

  start-all)
    if _cmd docker && [ -f "$DEV_DIR/docker-compose.yml" ]; then
      docker_up
      echo "➡️ Docker démarré. Démarrage du front en dev..."
      run_web
    else
      echo "➡️ Démarrage local (backend en BG + front en FG)..."
      start_both_local
    fi
    ;;

  stop)
    if _cmd docker && [ -f "$DEV_DIR/docker-compose.yml" ]; then
      docker_down
    else
      echo "Aucun service Docker à arrêter. (Si vous avez lancé des processus locaux, arrêtez-les manuellement.)"
    fi
    ;;

  stop-all)
    if _cmd docker && [ -f "$DEV_DIR/docker-compose.yml" ]; then
      docker_down
    else
      echo "➡️ Arrêt des services locaux..."
      stop_all_local
    fi
    ;;
  all)
    build_backend
    build_web
    build_mobile
    ;;
  *) echo "Action inconnue: $ACTION" >&2; usage; exit 2 ;;
esac
