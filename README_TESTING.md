# 🧪 MedRecord - Quick Testing Guide

## 🚀 Quick Start (Windows)

### Method 1: Using Test Script (Easiest)
```powershell
# Run the PowerShell test script
.\test-app.ps1
```

### Method 2: Manual Steps

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Start Metro Bundler
```bash
npm start
```

#### Step 3: Build & Run on Android

**Option A: Direct Run (if Android Studio is set up)**
```bash
npm run android
```

**Option B: Build APK**
```bash
cd android
.\gradlew assembleDebug
cd ..
```

The APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

**Option C: Install via ADB**
```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## 📱 Test Accounts

Use these credentials to test different user roles:

| Role | Username | Password |
|------|----------|----------|
| 👨‍⚕️ Doctor | `doctor1` | `password` |
| 👤 Patient | `patient1` | `password` |
| 💊 Pharmacist | `pharmacist1` | `password` |

## ✅ Testing Checklist

### Authentication
- [ ] Login screen appears
- [ ] Can login with test credentials
- [ ] Biometric login works (if device supports)
- [ ] Registration flow works

### Doctor Features
- [ ] Patient list loads
- [ ] Can search patients
- [ ] Can view patient details
- [ ] Can create prescriptions
- [ ] QR code scanning works
- [ ] Medicine database search works

### Patient Features
- [ ] Home dashboard shows
- [ ] Can view medications
- [ ] Can add allergies
- [ ] Lifestyle tracking works
- [ ] Can view prescriptions

### Pharmacist Features
- [ ] QR code scanning works
- [ ] Can dispense medications
- [ ] Inventory management works
- [ ] History shows dispensing records

## 🔧 Troubleshooting

### Metro Bundler Won't Start
```bash
npx expo start --clear
```

### Build Errors
```bash
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npx expo prebuild --clean
```

### Camera Not Working
- Check AndroidManifest.xml has camera permissions
- Grant camera permission in device settings
- Restart the app

### Module Resolution Errors
```bash
# Clear everything and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

## 📦 Available Scripts

```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Check code quality
npm run format     # Format code
npm run build:android  # Build Android APK
```

## 🎯 Next Steps

1. **Test all user flows** using the test accounts above
2. **Check camera functionality** (QR scanning, OCR)
3. **Verify navigation** between all screens
4. **Test data persistence** (logout/login should retain data)
5. **Test error handling** (invalid inputs, network errors)

## 📝 Notes

- This app uses **native modules** (Vision Camera), so you need a **development build**, not Expo Go
- The app stores data locally using AsyncStorage
- All data is mock data for testing purposes
- Camera features require physical device or emulator with camera support

---

For detailed testing instructions, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)


