@echo off
echo ========================================
echo   Travaux Routiers API - Demarrage
echo ========================================
echo.

echo Verification de Java...
java -version
if errorlevel 1 (
    echo ERREUR: Java n'est pas installe ou non trouve dans PATH
    pause
    exit /b 1
)

echo.
echo Verification de PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ATTENTION: PostgreSQL CLI non trouve
    echo Assurez-vous que PostgreSQL est en cours d'execution
)

echo.
echo Compilation du projet...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ERREUR: La compilation a echoue
    pause
    exit /b 1
)

echo.
echo Demarrage de l'application...
java -jar target\dev-0.0.1-SNAPSHOT.jar

pause
