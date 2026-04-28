/**
 * HERO Wallet Mobile — Navigation Stack
 * 
 * Screens:
 * 1. Splash → Loading screen with HERO branding
 * 2. BiometricLock → Face ID / Touch ID gate
 * 3. Wallet → Main WebView (wallet.herobase.io)
 * 4. Settings → Native settings (notifications, biometric toggle, about)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen imports (to be implemented)
// import SplashScreen from '../screens/SplashScreen';
// import BiometricLockScreen from '../screens/BiometricLockScreen';
// import WalletScreen from '../screens/WalletScreen';
// import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Splash: undefined;
  BiometricLock: undefined;
  Wallet: { initialPath?: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Deep linking configuration
const linking = {
  prefixes: ['hero-wallet://', 'https://wallet.herobase.io'],
  config: {
    screens: {
      Wallet: {
        path: 'wallet/:initialPath?',
      },
      Settings: 'settings',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Wallet"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        {/* Main wallet WebView */}
        <Stack.Screen name="Wallet" component={PlaceholderWallet} />
        <Stack.Screen name="Settings" component={PlaceholderSettings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder components — will be replaced with actual screens
function PlaceholderWallet() {
  return null; // App.tsx WebView handles this for now
}

function PlaceholderSettings() {
  return null;
}
