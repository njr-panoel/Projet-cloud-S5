@echo off
echo 🚀 Démarrage du projet Travaux Routiers
echo ======================================

REM Vérifier que Docker est installé
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier que Docker Compose est installé
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Nettoyer les anciens conteneurs
echo 🧹 Nettoyage des anciens conteneurs...
docker-compose down --remove-orphans

REM Construire et démarrer tous les services
echo 🏗️  Construction et démarrage des services...
docker-compose up --build -d

REM Attendre que les services soient prêts
echo ⏳ Attente du démarrage des services...
timeout /t 15 /nobreak

REM Vérifier l'état des services
echo 📋 État des services:
docker-compose ps

echo.
echo ✅ Projet démarré avec succès!
echo.
echo 📌 URLs disponibles:
echo    • Frontend (React):  http://localhost:3000
echo    • Backend (API):     http://localhost:8080
echo    • Swagger UI:        http://localhost:8080/swagger-ui.html
echo    • PgAdmin:           http://localhost:5050
echo    • Base de données:   localhost:5432
echo.
echo 🔑 Credentials PgAdmin:
echo    • Email: admin@travaux-routiers.mg
echo    • Password: admin123
echo.
echo 💡 Pour arrêter: docker-compose down
pause