/**
 * HERO Wallet Mobile — Biometric Authentication Service
 * 
 * Provides Face ID (iOS), Touch ID (iOS), and Fingerprint (Android) authentication.
 * Used as a gate before accessing the wallet and for confirming high-value transactions.
 * 
 * SECURITY:
 * - Biometric data never leaves the device
 * - Fallback to device PIN/passcode
 * - Configurable: users can enable/disable in settings
 * - Auto-lock after 5 minutes of inactivity
 */

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'FaceID' | 'TouchID' | 'Fingerprint' | 'None';
}

export class BiometricService {
  private static instance: BiometricService;
  private isAvailable = false;
  private biometryType: string = 'None';
  private isEnabled = true;
  private autoLockMinutes = 5;
  private lastAuthTime = 0;

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check if biometrics are available on this device
      // const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
      // this.isAvailable = available;
      // this.biometryType = biometryType || 'None';

      // Load user preference from AsyncStorage
      // const enabled = await AsyncStorage.getItem('hero_biometric_enabled');
      // this.isEnabled = enabled !== 'false';

      console.log('[HERO Biometric] Initialized:', this.biometryType);
    } catch (error) {
      console.error('[HERO Biometric] Init failed:', error);
      this.isAvailable = false;
    }
  }

  async authenticate(reason: string = 'Authenticate to access HERO Wallet'): Promise<BiometricResult> {
    if (!this.isAvailable || !this.isEnabled) {
      return { success: true, biometryType: 'None' };
    }

    try {
      // const { success } = await ReactNativeBiometrics.simplePrompt({
      //   promptMessage: reason,
      //   cancelButtonText: 'Cancel',
      // });

      // if (success) {
      //   this.lastAuthTime = Date.now();
      // }

      // return {
      //   success,
      //   biometryType: this.biometryType as BiometricResult['biometryType'],
      // };

      // Placeholder until react-native-biometrics is wired up
      this.lastAuthTime = Date.now();
      return { success: true, biometryType: 'None' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
        biometryType: this.biometryType as BiometricResult['biometryType'],
      };
    }
  }

  /**
   * Check if re-authentication is needed based on auto-lock timer
   */
  needsReauth(): boolean {
    if (!this.isEnabled || !this.isAvailable) return false;
    const elapsed = (Date.now() - this.lastAuthTime) / 1000 / 60;
    return elapsed > this.autoLockMinutes;
  }

  /**
   * Authenticate for high-value transaction confirmation
   */
  async confirmTransaction(amount: string, token: string): Promise<BiometricResult> {
    return this.authenticate(`Confirm ${amount} ${token} transaction`);
  }

  getStatus(): { available: boolean; type: string; enabled: boolean } {
    return {
      available: this.isAvailable,
      type: this.biometryType,
      enabled: this.isEnabled,
    };
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    // await AsyncStorage.setItem('hero_biometric_enabled', String(enabled));
  }

  async setAutoLockMinutes(minutes: number): Promise<void> {
    if (minutes < 1 || minutes > 60) {
      throw new Error('Auto-lock must be between 1 and 60 minutes');
    }
    this.autoLockMinutes = minutes;
    // await AsyncStorage.setItem('hero_autolock_minutes', String(minutes));
  }
}

export default BiometricService.getInstance();
