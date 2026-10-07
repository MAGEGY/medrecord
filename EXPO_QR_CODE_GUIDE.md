# 📱 Expo QR Code & APK Connection Guide

## How Expo QR Code Works

### Where the QR Code is Generated

**The QR code is NOT in your app code** - it's generated automatically by **Expo CLI** when you run:

```bash
npm start
# or
npx expo start
```

When you run this command, Expo CLI:
1. Starts Metro Bundler on port 8081
2. **Automatically generates a QR code** in your terminal
3. The QR code contains the connection URL (e.g., `exp://192.168.1.100:8081`)

### The QR Code Contains:
- Your computer's IP address
- Metro bundler port (usually 8081)
- Connection protocol (`exp://` for Expo)

## How to Connect APK to Expo Dev Server

### Method 1: Using Dev Menu (Recommended for Bare React Native)

Since this is a **bare React Native app** (has `android/` folder), you need to:

1. **Build and install the APK:**
   ```bash
   cd android
   .\gradlew assembleDebug
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Start Metro Bundler:**
   ```bash
   npm start
   ```
   Note the IP address shown (e.g., `192.168.1.100:8081`)

3. **Open Dev Menu in the app:**
   - **Physical device**: Shake the device
   - **Emulator**: Press `Ctrl+M` (Windows) or `Cmd+M` (Mac)
   - Or press `R` twice quickly

4. **Configure Bundler:**
   - In Dev Menu, select **"Configure Bundler"**
   - Enter: `http://YOUR_IP:8081`
   - Example: `http://192.168.1.100:8081`

### Method 2: Using Expo Dev Client (If Installed)

If you have Expo Dev Client installed:

1. **Start Metro with dev client:**
   ```bash
   npx expo start --dev-client
   ```

2. **Scan QR code** with the Expo Dev Client app
   - The dev client will automatically connect

### Method 3: Automatic Connection (Development Build)

If you build with `npx expo run:android`, it automatically:
- Builds the APK
- Installs it
- Connects to Metro bundler
- No QR code needed!

```bash
npm run test:android
# or
npx expo run:android
```

## Finding Your Computer's IP Address

### Windows:
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### Mac/Linux:
```bash
ifconfig
# or
ip addr show
```

## Code Locations

### 1. Metro Bundler Connection
**Location**: Handled by React Native, not in your code
- React Native automatically looks for Metro on `localhost:8081` in debug builds
- For device connection, you configure it via Dev Menu

### 2. Dev Menu Code
**Location**: `android/app/src/main/java/com/medrecord/app/MainActivity.kt`
- This is where React Native registers the dev menu
- The dev menu is built into React Native

### 3. Metro Bundler Start
**Location**: `package.json` scripts
```json
"start": "npx expo start"
```
- This command starts Metro and generates the QR code

### 4. App Entry Point
**Location**: `index.js`
```javascript
import { registerRootComponent } from "expo";
import App from "@/App";
registerRootComponent(App);
```
- This is where your app starts
- React Native connects to Metro automatically in debug mode

## Quick Test Steps

1. **Start Metro:**
   ```bash
   npm start
   ```
   You'll see a QR code in the terminal

2. **Build APK:**
   ```bash
   cd android
   .\gradlew assembleDebug
   ```

3. **Install APK:**
   ```bash
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

4. **Connect to Metro:**
   - Open app on device
   - Shake device → Dev Menu
   - Configure Bundler → Enter your IP:8081

## Troubleshooting

### QR Code Not Showing
- Make sure you're running `npx expo start` (not just `npm start` if that's different)
- Check that port 8081 is not blocked by firewall

### Can't Connect to Metro
- Ensure device and computer are on same WiFi network
- Check firewall allows port 8081
- Verify IP address is correct
- Try `http://` instead of `exp://` in dev menu

### Dev Menu Not Appearing
- Make sure you built a **debug** APK (not release)
- Check that `__DEV__` is enabled (it is by default in debug builds)

## Summary

- **QR Code Generation**: Automatic by Expo CLI (`npx expo start`)
- **Connection Code**: Built into React Native (no code needed)
- **Configuration**: Via Dev Menu (shake device → Configure Bundler)
- **IP Address**: Your computer's local network IP on port 8081

The QR code is just a convenient way to share the connection URL - you can also manually enter it in the Dev Menu!


