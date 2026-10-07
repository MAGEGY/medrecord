# Quick Test Guide - MedRecord App

## Fastest Way to Test (Android)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Metro Bundler
```bash
npm start
```

### Step 3: Build and Run on Android

**Option A: Using Expo (if native code is prebuilt)**
```bash
npm run android
```

**Option B: Build APK directly**
```bash
# In one terminal
npm start

# In another terminal
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Option C: Install via ADB**
```bash
# After building APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Connect to Metro
- Open the app on your device
- Shake device or press `Ctrl+M` (Android emulator) to open dev menu
- Select "Configure Bundler" and enter your computer's IP address
- Or scan the QR code from Metro bundler

## Test Credentials

**Doctor:**
- Username: `doctor1`
- Password: `password`

**Patient:**
- Username: `patient1`
- Password: `password`

**Pharmacist:**
- Username: `pharmacist1`
- Password: `password`

## Quick Test Checklist

- [ ] App launches successfully
- [ ] Login screen appears
- [ ] Can login with test credentials
- [ ] Navigation works (tab bar appears)
- [ ] Can navigate between screens
- [ ] Camera permissions work (for QR scanning)
- [ ] Can create/view prescriptions (doctor)
- [ ] Can view medications (patient)
- [ ] Can dispense (pharmacist)

## Troubleshooting

**"Unable to resolve module" errors:**
```bash
npm install
npx expo start --clear
```

**Build fails:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

**Metro bundler issues:**
```bash
npx expo start --clear
# Or
watchman watch-del-all
rm -rf node_modules
npm install
```


