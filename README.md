# HERO Wallet Mobile

React Native mobile app for the HERO Wallet ecosystem. This is a WebView wrapper around `wallet.herobase.io` with native bridges for biometric authentication, push notifications, deep linking, and secure storage.

## Architecture

The mobile app follows a **hybrid architecture** — the wallet UI runs as a responsive web app inside a WebView, while native capabilities are exposed through the `window.HeroBridge` JavaScript bridge.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI | WebView → wallet.herobase.io | Full wallet interface |
| Auth | react-native-biometrics | Face ID / Touch ID / Fingerprint |
| Storage | AsyncStorage | Session tokens, preferences |
| Notifications | Firebase Cloud Messaging | Push alerts for transactions |
| Deep Links | hero-wallet:// scheme | External app linking |
| Navigation | React Navigation | Native screen transitions |

## Why WebView?

The wallet UI is already fully responsive and battle-tested on the web. A WebView wrapper gives us immediate mobile presence while we evaluate whether a fully native rewrite is justified. The native bridge (`HeroBridge`) provides escape hatches for any feature that needs native APIs.

**No private keys are stored on the device.** All cryptographic operations happen server-side via the Railgun SDK.

## Setup

### Prerequisites

- Node.js 22+
- React Native CLI
- Xcode 15+ (iOS)
- Android Studio (Android)
- CocoaPods (iOS)

### Install

```bash
npm install
cd ios && pod install && cd ..
```

### Run

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## TestFlight Deployment (iOS)

1. Open `ios/HeroWallet.xcworkspace` in Xcode
2. Set the Team to your Apple Developer account
3. Set Bundle ID: `io.herobase.wallet`
4. Archive: Product → Archive
5. Upload to App Store Connect
6. In App Store Connect → TestFlight → Add testers
7. Testers receive invite via email → install via TestFlight app

## Android Distribution

1. Generate release keystore: `keytool -genkeypair -v -storetype PKCS12 -keystore hero-wallet.keystore -alias hero-wallet -keyalg RSA -keysize 2048 -validity 10000`
2. Build release APK: `cd android && ./gradlew assembleRelease`
3. APK location: `android/app/build/outputs/apk/release/app-release.apk`
4. Distribute via direct APK download or Google Play Console

## Native Bridge API

The web app can access native features through `window.HeroBridge`:

```javascript
// Check if running in native app
if (window.HeroBridge?.isNative) {
  console.log('Running on', window.HeroBridge.platform);
}

// Request biometric authentication
window.HeroBridge.requestBiometric();

// Share content via native share sheet
window.HeroBridge.share('Check out HERO Wallet!', 'https://wallet.herobase.io');

// Store/retrieve session data
window.HeroBridge.storeSession({ token: '...', expiry: '...' });
window.HeroBridge.getSession();
```

## Security

- No private keys stored on device
- Biometric auth for app access
- SSL pinning for wallet.herobase.io
- Origin whitelist restricts WebView navigation
- File access disabled in WebView
- All Codex-audited before release

## License

MIT — VetsInCrypto / HERO Ecosystem
