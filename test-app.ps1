# MedRecord App Testing Script for Windows
# Run this script to quickly test the app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedRecord App - Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Choose testing method:" -ForegroundColor Cyan
Write-Host "1. Start Metro Bundler (for development)" -ForegroundColor White
Write-Host "2. Build Android APK" -ForegroundColor White
Write-Host "3. Run on Android (requires emulator/device)" -ForegroundColor White
Write-Host "4. Clear cache and restart" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Starting Metro Bundler..." -ForegroundColor Yellow
        Write-Host "Press 'a' to open on Android, 'i' for iOS, or scan QR code" -ForegroundColor Cyan
        npm start
    }
    "2" {
        Write-Host "Building Android APK..." -ForegroundColor Yellow
        Write-Host "This may take a few minutes..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew assembleDebug
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ APK built successfully!" -ForegroundColor Green
            Write-Host "Location: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "To install on device:" -ForegroundColor Yellow
            Write-Host "  adb install android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
        }
        Set-Location ..
    }
    "3" {
        Write-Host "Starting Metro and running on Android..." -ForegroundColor Yellow
        npm run android
    }
    "4" {
        Write-Host "Clearing cache..." -ForegroundColor Yellow
        npx expo start --clear
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Doctor:     doctor1 / password" -ForegroundColor White
Write-Host "  Patient:    patient1 / password" -ForegroundColor White
Write-Host "  Pharmacist: pharmacist1 / password" -ForegroundColor White


