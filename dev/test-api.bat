@echo off
setlocal enabledelayedexpansion

set API_URL=http://localhost:8080
set TOKEN=

echo =========================================
echo   Tests API Travaux Routiers
echo =========================================
echo.

REM Test 1: Inscription Manager
echo Test 1: Inscription Manager
curl -s -X POST "%API_URL%/api/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"manager@test.com\",\"password\":\"password123\",\"nom\":\"Razafi\",\"prenom\":\"Marie\",\"role\":\"MANAGER\"}" > response.json

findstr /C:"success" response.json >nul
if !errorlevel! equ 0 (
    echo [OK] Inscription reussie
) else (
    echo [ERREUR] Echec inscription
)
echo.

REM Test 2: Connexion
echo Test 2: Connexion
curl -s -X POST "%API_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"manager@test.com\",\"password\":\"password123\"}" > response.json

REM Extraire le token (simplifie)
for /f "tokens=2 delims=:," %%a in ('findstr /C:"token" response.json') do (
    set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN: =!
)

if defined TOKEN (
    echo [OK] Connexion reussie
    echo Token: !TOKEN:~0,50!...
) else (
    echo [ERREUR] Echec connexion
)
echo.

REM Test 3: Creation signalement
echo Test 3: Creation signalement
curl -s -X POST "%API_URL%/api/signalements" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !TOKEN!" ^
  -d "{\"titre\":\"Test - Nid de poule\",\"description\":\"Test automatique\",\"typeTravaux\":\"NIDS_DE_POULE\",\"latitude\":-18.8792,\"longitude\":47.5079,\"adresse\":\"Avenue de l'Independance\"}" > response.json

findstr /C:"success" response.json >nul
if !errorlevel! equ 0 (
    echo [OK] Signalement cree
) else (
    echo [ERREUR] Echec creation signalement
)
echo.

REM Test 4: Liste signalements
echo Test 4: Liste des signalements
curl -s -X GET "%API_URL%/api/signalements" > response.json
echo [OK] Voir response.json pour les resultats
echo.

REM Test 5: Swagger UI
echo Test 5: Swagger UI
curl -s -o nul -w "%%{http_code}" "%API_URL%/swagger-ui.html" > http_code.txt
set /p HTTP_CODE=<http_code.txt

if "!HTTP_CODE!"=="200" (
    echo [OK] Swagger accessible
    echo URL: %API_URL%/swagger-ui.html
) else (
    echo [ERREUR] Swagger inaccessible
)
echo.

REM Cleanup
del response.json http_code.txt 2>nul

echo =========================================
echo Tests termines !
echo =========================================
pause
