# HERO Wallet Mobile App

React Native (Expo) mobile wallet for the HERO ecosystem on BASE and PulseChain.

## Features

- **Multi-chain support**: BASE (8453) and PulseChain (369)
- **Send/Receive**: Native tokens + ERC-20 (HERO, VETS)
- **DEX Swap**: Aerodrome (BASE) / PulseX (PulseChain) via wallet-api
- **Privacy**: Railgun integration for shielded transactions
- **RPC Failover**: 6 BASE RPCs + 3 PulseChain RPCs with auto-failover
- **Secure Storage**: Private keys encrypted via expo-secure-store
- **Token Approvals Audit**: View and revoke risky approvals

## Token Addresses

| Token | Chain | Address |
|-------|-------|---------|
| HERO | BASE | `0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8` |
| HERO | PulseChain | `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` |
| VETS | PulseChain | `0x4013abBf94A745EfA7cc848989Ee83424A770060` |

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Build APK (production)
eas build --platform android --profile production
```

## Architecture

```
src/
├── config/       # Token addresses, chain configs, RPC endpoints
├── contexts/     # WalletContext (state management)
├── screens/      # Wallet, Send, Receive, Swap, Settings
├── components/   # Reusable UI components
├── services/     # API calls to wallet-api backend
└── utils/        # Helpers, formatters
```

## Backend

Connects to wallet-api on VDS S (port 3001) for:
- Balance checking (multi-chain)
- Transaction history
- DEX aggregation (swap routing)
- Cross-chain bridge
- Railgun privacy operations
- Token approval auditing

## Security

- Private keys never leave the device (expo-secure-store)
- Biometric unlock support (planned)
- Transaction signing happens locally
- Only public data fetched from wallet-api

## Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```
