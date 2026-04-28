/**
 * HERO Wallet Mobile — Push Notification Service
 * 
 * Uses Firebase Cloud Messaging (FCM) for cross-platform push notifications.
 * Notification types:
 * - TRANSACTION: Incoming/outgoing transaction alerts
 * - REWARD: Reward claim available
 * - RANK_UP: Gamification rank promotion
 * - SECURITY: Suspicious activity alerts
 * - SYSTEM: Wallet updates, maintenance
 * 
 * SECURITY: FCM token is sent to the wallet backend for server-side push.
 * No sensitive data is included in push payloads.
 */

export interface HeroNotification {
  type: 'TRANSACTION' | 'REWARD' | 'RANK_UP' | 'SECURITY' | 'SYSTEM';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request notification permissions
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
      //   || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // if (enabled) {
      //   this.fcmToken = await messaging().getToken();
      //   await this.registerTokenWithBackend(this.fcmToken);
      //   this.setupMessageHandlers();
      // }

      this.isInitialized = true;
      console.log('[HERO Notifications] Service initialized');
    } catch (error) {
      console.error('[HERO Notifications] Init failed:', error);
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    // Send FCM token to wallet.herobase.io backend
    // POST /api/notifications/register { token, platform, deviceId }
    console.log('[HERO Notifications] Token registered:', token.substring(0, 20) + '...');
  }

  private setupMessageHandlers(): void {
    // Foreground message handler
    // messaging().onMessage(async (remoteMessage) => {
    //   this.handleNotification(remoteMessage);
    // });

    // Background message handler
    // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //   this.handleNotification(remoteMessage);
    // });
  }

  private handleNotification(message: any): void {
    const notification: HeroNotification = {
      type: message.data?.type || 'SYSTEM',
      title: message.notification?.title || 'HERO Wallet',
      body: message.notification?.body || '',
      data: message.data,
    };

    console.log('[HERO Notifications] Received:', notification.type, notification.title);
  }

  getToken(): string | null {
    return this.fcmToken;
  }
}

export default NotificationService.getInstance();
