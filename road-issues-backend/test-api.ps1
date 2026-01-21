# Road Issues API - Test Script for Windows PowerShell
# This script tests all main API endpoints

$API_URL = "http://localhost:8080/api"

# Function to make colored output
function Write-Section {
    param([string]$Text)
    Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Write-TestHeader {
    param([string]$Text)
    Write-Host "`n$Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host $Text -ForegroundColor Green
}

Write-Section "Road Issues API - Test Suite"

# 1. Get Statistics (Public)
Write-TestHeader "1. Testing GET /api/stats (Public)"
$statsResponse = curl.exe -s -X GET "$API_URL/stats" `
    -H "Content-Type: application/json"
Write-Host $statsResponse
$statsResponse | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host

# 2. Register New User
Write-TestHeader "2. Testing POST /api/auth/register"
$registerBody = @{
    nom = "Test User"
    email = "testuser@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

$registerResponse = curl.exe -s -X POST "$API_URL/auth/register" `
    -H "Content-Type: application/json" `
    -d $registerBody

Write-Host $registerResponse
$registerJson = $registerResponse | ConvertFrom-Json
$USER_TOKEN = $registerJson.accessToken
$USER_ID = $registerJson.userId

Write-Success "User Token: $USER_TOKEN"
Write-Success "User ID: $USER_ID"

# 3. Login
Write-TestHeader "3. Testing POST /api/auth/login"
$loginBody = @{
    email = "testuser@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

$loginResponse = curl.exe -s -X POST "$API_URL/auth/login" `
    -H "Content-Type: application/json" `
    -d $loginBody

Write-Host $loginResponse
$loginJson = $loginResponse | ConvertFrom-Json
$LOGIN_TOKEN = $loginJson.accessToken
Write-Success "Login Token: $LOGIN_TOKEN"

# 4. Get User Profile
Write-TestHeader "4. Testing GET /api/auth/me (Protected)"
$meResponse = curl.exe -s -X GET "$API_URL/auth/me" `
    -H "Authorization: Bearer $USER_TOKEN" `
    -H "Content-Type: application/json"
Write-Host $meResponse

# 5. Update User Profile
Write-TestHeader "5. Testing PATCH /api/auth/profile (Protected)"
$updateProfileBody = @{
    nom = "Updated Test User"
    email = "testuser@example.com"
} | ConvertTo-Json

$updateProfileResponse = curl.exe -s -X PATCH "$API_URL/auth/profile" `
    -H "Authorization: Bearer $USER_TOKEN" `
    -H "Content-Type: application/json" `
    -d $updateProfileBody

Write-Host $updateProfileResponse

# 6. Create Signalement
Write-TestHeader "6. Testing POST /api/signalements (Protected)"
$signalementBody = @{
    latitude = -18.8792
    longitude = 47.5079
    description = "Large pothole on Avenue de l'Indépendance, Antananarivo"
    photoUrl = "https://example.com/photo.jpg"
} | ConvertTo-Json

$signalementResponse = curl.exe -s -X POST "$API_URL/signalements" `
    -H "Authorization: Bearer $USER_TOKEN" `
    -H "Content-Type: application/json" `
    -d $signalementBody

Write-Host $signalementResponse
$signalementJson = $signalementResponse | ConvertFrom-Json
$SIGNALEMENT_ID = $signalementJson.id
Write-Success "Signalement ID: $SIGNALEMENT_ID"

# 7. Get All Signalements (Public)
Write-TestHeader "7. Testing GET /api/signalements (Public)"
$allSignalementsResponse = curl.exe -s -X GET "$API_URL/signalements?size=10&page=0" `
    -H "Content-Type: application/json"
Write-Host $allSignalementsResponse

# 8. Get Signalement by ID (Public)
Write-TestHeader "8. Testing GET /api/signalements/{id} (Public)"
$signalementByIdResponse = curl.exe -s -X GET "$API_URL/signalements/$SIGNALEMENT_ID" `
    -H "Content-Type: application/json"
Write-Host $signalementByIdResponse

# 9. Get User's Signalements
Write-TestHeader "9. Testing GET /api/signalements/user/my-reports (Protected)"
$userSignalementsResponse = curl.exe -s -X GET "$API_URL/signalements/user/my-reports?size=10" `
    -H "Authorization: Bearer $USER_TOKEN" `
    -H "Content-Type: application/json"
Write-Host $userSignalementsResponse

# 10. Create Manager User for testing manager endpoints
Write-TestHeader "10. Creating Manager User for Manager Tests"
$managerBody = @{
    nom = "Test Manager"
    email = "testmanager@example.com"
    password = "ManagerPass123!"
} | ConvertTo-Json

$managerResponse = curl.exe -s -X POST "$API_URL/auth/register" `
    -H "Content-Type: application/json" `
    -d $managerBody

Write-Host $managerResponse
$managerJson = $managerResponse | ConvertFrom-Json
$MANAGER_TOKEN = $managerJson.accessToken
$MANAGER_ID = $managerJson.userId
Write-Success "Manager Token: $MANAGER_TOKEN"

# 11. Update Signalement (Manager Only)
Write-TestHeader "11. Testing PATCH /api/signalements/{id} (Manager Only)"
$updateSignalementBody = @{
    statut = "EN_COURS"
    surfaceM2 = 15.5
    budget = 5000
    entreprise = "TP Ravina"
} | ConvertTo-Json

$updateSignalementResponse = curl.exe -s -X PATCH "$API_URL/signalements/$SIGNALEMENT_ID" `
    -H "Authorization: Bearer $MANAGER_TOKEN" `
    -H "Content-Type: application/json" `
    -d $updateSignalementBody

Write-Host $updateSignalementResponse

# 12. Get Historique (Manager Only)
Write-TestHeader "12. Testing GET /api/historiques/{id} (Manager Only)"
$historiqueResponse = curl.exe -s -X GET "$API_URL/historiques/$SIGNALEMENT_ID" `
    -H "Authorization: Bearer $MANAGER_TOKEN" `
    -H "Content-Type: application/json"
Write-Host $historiqueResponse

# 13. Admin - Unblock User
Write-TestHeader "13. Testing POST /api/admin/unblock/{userId} (Manager Only)"
$unblockResponse = curl.exe -s -X POST "$API_URL/admin/unblock/$USER_ID" `
    -H "Authorization: Bearer $MANAGER_TOKEN" `
    -H "Content-Type: application/json"
Write-Host $unblockResponse

# 14. Get Statistics Again
Write-TestHeader "14. Testing GET /api/stats After Updates (Public)"
$finalStatsResponse = curl.exe -s -X GET "$API_URL/stats" `
    -H "Content-Type: application/json"
Write-Host $finalStatsResponse

Write-Section "Test Suite Complete"

Write-Success "Summary:"
Write-Host "- User created with email: testuser@example.com"
Write-Host "- User ID: $USER_ID"
Write-Host "- Manager created with email: testmanager@example.com"
Write-Host "- Manager ID: $MANAGER_ID"
Write-Host "- Signalement created with ID: $SIGNALEMENT_ID"
Write-Host "- Status updated to EN_COURS"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Access Swagger UI: http://localhost:8080/api/swagger-ui.html"
Write-Host "2. Test with your own data"
Write-Host "3. Review logs in the running terminal"
