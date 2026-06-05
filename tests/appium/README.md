# Appium Testing

To run the Appium tests, you need a running Android emulator.

## Prerequisites

- Node.js
- Appium 2 (`npm install -g appium`)
- UiAutomator2 driver (`appium driver install uiautomator2`)
- Android SDK & Android Studio

## Start an emulator

```bash
# List available AVDs
emulator -list-avds

# Start an AVD (e.g. Pixel_7_API_34)
emulator -avd Pixel_7_API_34 -no-audio -no-window &
adb wait-for-device
```

If no AVDs exist, you will need to create one through Android Studio's Device Manager, or via `avdmanager`.

## Network access from Emulator

To make your local dev server reachable from the emulator, make sure you bind to `0.0.0.0` or use `adb reverse`:

```bash
adb reverse tcp:6180 tcp:6180
```

## Running the tests

```bash
npm run test:appium
```
