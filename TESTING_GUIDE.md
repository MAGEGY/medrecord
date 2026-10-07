# MedRecord - Testing Guide

## Quick Start Testing

### Option 1: Development Build (Recommended for Native Modules)

Since this app uses native modules like `react-native-vision-camera`, you'll need a development build.

#### Prerequisites
- Node.js installed
- Android Studio (for Android testing)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (optional, for cloud builds)

#### Steps:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Metro Bundler**
   ```bash
   npm start
   # or
   npx expo start
   ```

3. **For Android Development Build:**
   ```bash
   # Generate native code (if needed)
   npx expo prebuild --platform android
   
   # Run on Android device/emulator
   npm run android
   # or
   npx expo run:android
   ```

4. **For iOS Development Build:**
   ```bash
   # Generate native code (if needed)
   npx expo prebuild --platform ios
   
   # Run on iOS device/simulator
   npm run ios
   # or
   npx expo run:ios
   ```

### Option 2: EAS Build (Cloud Build)

1. **Initialize EAS (if not done)**
   ```bash
   npx eas init
   ```

2. **Configure eas.json** (see below)

3. **Build Development Build**
   ```bash
   # Android
   eas build --profile development --platform android
   
   # iOS
   eas build --profile development --platform ios
   ```

4. **Install on Device**
   - Download the build from EAS
   - Install on your device
   - Run `npx expo start --dev-client` to connect

### Option 3: Local Android Build

1. **Build APK locally**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   
   APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Install on Device**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Test Accounts

### Doctor Account
- Username: `doctor1`
- Password: `password`
- Role: Doctor

### Patient Account
- Username: `patient1`
- Password: `password`
- Role: Patient

### Pharmacist Account
- Username: `pharmacist1`
- Password: `password`
- Role: Pharmacist

## Testing Features

### Authentication
- ✅ Login with username/password
- ✅ Biometric authentication
- ✅ Registration flow
- ✅ Role-based navigation

### Doctor Features
- ✅ Patient list and search
- ✅ Patient detail view
- ✅ Create prescriptions
- ✅ Scan patient QR codes
- ✅ Medicine database search
- ✅ View prescriptions

### Patient Features
- ✅ Home dashboard
- ✅ Medication management
- ✅ Lifestyle tracking
- ✅ View prescriptions
- ✅ Allergy management

### Pharmacist Features
- ✅ Scan prescription QR codes
- ✅ Dispense medications
- ✅ Inventory management
- ✅ Dispensing history

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted
- For Android: Check `AndroidManifest.xml` has camera permissions
- For development builds: Camera requires native modules

### Build Errors
- Run `npx expo prebuild --clean` to regenerate native code
- Clear cache: `npx expo start --clear`
- Delete `node_modules` and reinstall

### Metro Bundler Issues
- Clear Metro cache: `npx expo start --clear`
- Reset Metro: `npx react-native start --reset-cache`

## Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint

# Format code
npm run format
```


