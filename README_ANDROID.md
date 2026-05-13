# Android build instructions (Capacitor)

Prerequisites:
- Install Node.js and npm
- Install Android Studio (with SDK) and JDK

Quick steps:

```bash
# 1) Install JS deps
npm install

# 2) Build web assets
npm run build

# 3) Initialize Capacitor (first time only) or run the helper script
npm run cap:init

# 4) Add Android platform
npm run cap:add-android

# 5) Sync / copy web assets
npm run cap:sync

# 6) Open Android project in Android Studio
npm run cap:open-android
```

Notes:
- `cap:init` uses the project name; if it fails, run `npx cap init "YourAppName" com.example.yourapp --web-dir=dist` instead.
- Build output from `vite` is placed into the `dist` folder which Capacitor uses as `webDir`.
- After opening in Android Studio you can run on emulator/device and produce an APK.
