#!/bin/bash
# MedRecord App Testing Script for Linux/Mac
# Run this script to quickly test the app

echo "========================================"
echo "MedRecord App - Testing Script"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✓ Node.js installed: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "✗ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "Choose testing method:"
echo "1. Start Metro Bundler (for development)"
echo "2. Build Android APK"
echo "3. Run on Android (requires emulator/device)"
echo "4. Clear cache and restart"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Starting Metro Bundler..."
        echo "Press 'a' to open on Android, 'i' for iOS, or scan QR code"
        npm start
        ;;
    2)
        echo "Building Android APK..."
        echo "This may take a few minutes..."
        cd android
        ./gradlew assembleDebug
        if [ $? -eq 0 ]; then
            echo ""
            echo "✓ APK built successfully!"
            echo "Location: android/app/build/outputs/apk/debug/app-debug.apk"
            echo ""
            echo "To install on device:"
            echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
        fi
        cd ..
        ;;
    3)
        echo "Starting Metro and running on Android..."
        npm run android
        ;;
    4)
        echo "Clearing cache..."
        npx expo start --clear
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "Test Credentials:"
echo "  Doctor:     doctor1 / password"
echo "  Patient:    patient1 / password"
echo "  Pharmacist: pharmacist1 / password"


