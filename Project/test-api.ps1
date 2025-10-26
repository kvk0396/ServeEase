# Test Script for Local Service Provider Finder API
Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing Local Service Provider Finder API" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Test if application is running
Write-Host "1. Testing if application is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/validate" -Method GET -Headers @{"Authorization"="Bearer test"} -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Application is running!" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✓ Application is running! (Expected 400 for invalid token)" -ForegroundColor Green
    }
    else {
        Write-Host "   ✗ Application might not be running. Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Please start it first: mvnw.cmd spring-boot:run" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Test login with admin user
Write-Host "2. Testing login with admin user..." -ForegroundColor Yellow
$loginBody = '{"email":"admin@servicefinder.com","password":"admin123"}'

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✓ Admin login successful!" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "   User: $($loginResponse.fullName) ($($loginResponse.role))" -ForegroundColor Cyan
    
    $adminToken = $loginResponse.token
    
    # Test token validation
    Write-Host ""
    Write-Host "3. Testing token validation..." -ForegroundColor Yellow
    $authHeader = @{"Authorization" = "Bearer $adminToken"}
    $validateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/validate" -Method GET -Headers $authHeader -ErrorAction Stop
    Write-Host "   ✓ Token validation successful!" -ForegroundColor Green
    Write-Host "   Validated user: $($validateResponse.fullName)" -ForegroundColor Cyan
}
catch {
    Write-Host "   ✗ Login failed! Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test login with customer user
Write-Host "4. Testing login with customer user..." -ForegroundColor Yellow
$customerLoginBody = '{"email":"customer@test.com","password":"customer123"}'

try {
    $customerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $customerLoginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✓ Customer login successful!" -ForegroundColor Green
    Write-Host "   User: $($customerResponse.fullName) ($($customerResponse.role))" -ForegroundColor Cyan
}
catch {
    Write-Host "   ✗ Customer login failed! Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test login with service provider user
Write-Host "5. Testing login with service provider user..." -ForegroundColor Yellow
$providerLoginBody = '{"email":"provider@test.com","password":"provider123"}'

try {
    $providerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $providerLoginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✓ Service Provider login successful!" -ForegroundColor Green
    Write-Host "   User: $($providerResponse.fullName) ($($providerResponse.role))" -ForegroundColor Cyan
}
catch {
    Write-Host "   ✗ Service Provider login failed! Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Your Application:" -ForegroundColor Yellow
Write-Host "• Swagger UI: http://localhost:8080/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host "• H2 Database: http://localhost:8080/api/h2-console" -ForegroundColor Cyan
Write-Host "• API Docs: http://localhost:8080/api/v3/api-docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Test Users:" -ForegroundColor Yellow
Write-Host "• Admin: admin@servicefinder.com / admin123" -ForegroundColor Cyan
Write-Host "• Customer: customer@test.com / customer123" -ForegroundColor Cyan
Write-Host "• Provider: provider@test.com / provider123" -ForegroundColor Cyan 