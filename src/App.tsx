/**
 * HERO Wallet Mobile — React Native WebView Wrapper
 * 
 * Architecture: WebView pointing to wallet.herobase.io with native bridges for:
 * - Biometric authentication (Face ID / Touch ID / Fingerprint)
 * - Push notifications via Firebase Cloud Messaging
 * - Deep linking (hero-wallet:// scheme)
 * - Secure storage for session tokens
 * - Native share sheet
 * 
 * SECURITY: All sensitive operations go through the WebView bridge.
 * No private keys are stored on the device — they stay in the Railgun SDK on the server.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── CONFIGURATION ──
const WALLET_URL = 'https://wallet.herobase.io';
const FALLBACK_URL = 'https://herobase.io';
const APP_VERSION = '0.1.0';

// Color palette matching the web wallet
const COLORS = {
  background: '#0a0a0a',
  gold: '#d4a843',
  green: '#00ff88',
  text: '#cccccc',
  textDim: '#666666',
  border: '#1a1a1a',
};

// ── LOADING SCREEN ──
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingLogo}>⛨</Text>
      <Text style={styles.loadingTitle}>HERO WALLET</Text>
      <Text style={styles.loadingSubtitle}>Powered by Railgun SDK</Text>
      <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 24 }} />
      <Text style={styles.loadingVersion}>v{APP_VERSION}</Text>
    </View>
  );
}

// ── ERROR SCREEN ──
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>CONNECTION LOST</Text>
      <Text style={styles.errorMessage}>
        Unable to reach wallet.herobase.io. Check your internet connection and try again.
      </Text>
      <Text style={styles.retryButton} onPress={onRetry}>
        RETRY CONNECTION
      </Text>
    </View>
  );
}

// ── MAIN APP ──
export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle deep links (hero-wallet:// scheme)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.startsWith('hero-wallet://')) {
        const path = url.replace('hero-wallet://', '');
        webViewRef.current?.injectJavaScript(
          `window.location.href = '${WALLET_URL}/${path}';`
        );
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // WebView → Native bridge message handler
  const handleMessage = useCallback(async (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'BIOMETRIC_AUTH':
          // Trigger native biometric authentication
          // ReactNativeBiometrics will be integrated in Phase 5
          Alert.alert('Biometric Auth', 'Face ID / Touch ID will be available in the next release.');
          break;

        case 'SHARE':
          // Native share sheet
          // Share.share({ message: message.payload.text, url: message.payload.url });
          break;

        case 'STORE_SESSION':
          await AsyncStorage.setItem('hero_session', JSON.stringify(message.payload));
          break;

        case 'GET_SESSION':
          const session = await AsyncStorage.getItem('hero_session');
          webViewRef.current?.injectJavaScript(
            `window.postMessage(${JSON.stringify({ type: 'SESSION_DATA', payload: session ? JSON.parse(session) : null })}, '*');`
          );
          break;

        case 'NOTIFICATION':
          // Push notification will be wired up with Firebase in Phase 5
          break;

        default:
          console.log('[HERO Bridge] Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('[HERO Bridge] Message parse error:', err);
    }
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  // JavaScript to inject into the WebView for native bridge
  const INJECTED_JS = `
    (function() {
      // Expose native bridge to the web app
      window.HeroBridge = {
        requestBiometric: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BIOMETRIC_AUTH' }));
        },
        share: function(text, url) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHARE', payload: { text, url } }));
        },
        storeSession: function(data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STORE_SESSION', payload: data }));
        },
        getSession: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_SESSION' }));
        },
        platform: '${Platform.OS}',
        version: '${APP_VERSION}',
        isNative: true,
      };

      // Notify web app that native bridge is ready
      window.dispatchEvent(new CustomEvent('hero-bridge-ready'));
    })();
    true;
  `;

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ErrorScreen onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {isLoading && <LoadingScreen />}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WALLET_URL }}
        style={[styles.webview, isLoading && styles.hidden]}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setHasError(true);
          }
        }}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        // Security
        originWhitelist={['https://*', 'hero-wallet://*']}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        // Performance
        renderToHardwareTextureAndroid={true}
        androidLayerType="hardware"
      />
    </SafeAreaView>
  );
}

// ── STYLES ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  // Loading
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 4,
  },
  loadingSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 8,
    letterSpacing: 2,
  },
  loadingVersion: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    color: COLORS.textDim,
    position: 'absolute',
    bottom: 40,
  },
  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    letterSpacing: 2,
    overflow: 'hidden',
  },
});
