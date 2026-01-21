@echo off
REM Road Issues API - Test Script for Windows
REM This script tests all main API endpoints

setlocal enabledelayedexpansion

set API_URL=http://localhost:8080/api

echo.
echo ========================================
echo Road Issues API - Test Suite
echo ========================================
echo.

REM 1. Get Statistics (Public)
echo [1] Testing GET /api/stats (Public)
curl -s -X GET "%API_URL%/stats" ^
    -H "Content-Type: application/json"
echo.
echo.

REM 2. Register New User
echo [2] Testing POST /api/auth/register
for /f "delims=" %%A in ('curl -s -X POST "%API_URL%/auth/register" ^
    -H "Content-Type: application/json" ^
    -d "{\"nom\":\"Test User\",\"email\":\"testuser@example.com\",\"password\":\"TestPass123!\"}"') do (
    set "REGISTER_RESPONSE=%%A"
)

echo !REGISTER_RESPONSE!
echo.

REM Extract token (simple parsing)
for /f "tokens=2 delims=:" %%A in ('echo !REGISTER_RESPONSE! ^| findstr /r "accessToken"') do (
    set "USER_TOKEN=%%A"
)
set "USER_TOKEN=!USER_TOKEN:~1,-2!"
set "USER_TOKEN=!USER_TOKEN: =!"

echo User Token: !USER_TOKEN!
echo.
echo.

REM 3. Login
echo [3] Testing POST /api/auth/login
for /f "delims=" %%A in ('curl -s -X POST "%API_URL%/auth/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"testuser@example.com\",\"password\":\"TestPass123!\"}"') do (
    set "LOGIN_RESPONSE=%%A"
)

echo !LOGIN_RESPONSE!
echo.
echo.

REM 4. Get User Profile
echo [4] Testing GET /api/auth/me (Protected)
curl -s -X GET "%API_URL%/auth/me" ^
    -H "Authorization: Bearer !USER_TOKEN!" ^
    -H "Content-Type: application/json"
echo.
echo.

REM 5. Update User Profile
echo [5] Testing PATCH /api/auth/profile (Protected)
curl -s -X PATCH "%API_URL%/auth/profile" ^
    -H "Authorization: Bearer !USER_TOKEN!" ^
    -H "Content-Type: application/json" ^
    -d "{\"nom\":\"Updated Test User\",\"email\":\"testuser@example.com\"}"
echo.
echo.

REM 6. Create Signalement
echo [6] Testing POST /api/signalements (Protected)
for /f "delims=" %%A in ('curl -s -X POST "%API_URL%/signalements" ^
    -H "Authorization: Bearer !USER_TOKEN!" ^
    -H "Content-Type: application/json" ^
    -d "{\"latitude\":-18.8792,\"longitude\":47.5079,\"description\":\"Large pothole on Avenue de l Independance\",\"photoUrl\":\"https://example.com/photo.jpg\"}"') do (
    set "SIGNALEMENT_RESPONSE=%%A"
)

echo !SIGNALEMENT_RESPONSE!
echo.
echo.

REM 7. Get All Signalements (Public)
echo [7] Testing GET /api/signalements (Public)
curl -s -X GET "%API_URL%/signalements?size=10&page=0" ^
    -H "Content-Type: application/json"
echo.
echo.

REM 8. Get Statistics Again
echo [8] Testing GET /api/stats After Updates (Public)
curl -s -X GET "%API_URL%/stats" ^
    -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo Test Suite Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Access Swagger UI: http://localhost:8080/api/swagger-ui.html
echo 2. Test with your own data
echo 3. Review logs in the running terminal
echo.

endlocal
