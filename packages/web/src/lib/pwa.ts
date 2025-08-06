// PWA utilities for service worker registration and management
import { useState, useEffect } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAConfig {
  swPath?: string;
  scope?: string;
  enableNotifications?: boolean;
  enableBackgroundSync?: boolean;
  updateCheckInterval?: number;
}

export class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private config: Required<PWAConfig>;
  private updateCheckTimer?: NodeJS.Timeout;

  constructor(config: PWAConfig = {}) {
    this.config = {
      swPath: '/sw.js',
      scope: '/',
      enableNotifications: true,
      enableBackgroundSync: true,
      updateCheckInterval: 60000, // 1 minute
      ...config
    };

    this.initialize();
  }

  private async initialize() {
    if (!('serviceWorker' in navigator)) {
      console.warn('PWA: Service Workers not supported');
      return;
    }

    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupUpdateChecks();
    this.setupNetworkListeners();
  }

  // Register service worker
  private async registerServiceWorker(): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.register(
        this.config.swPath,
        { scope: this.config.scope }
      );

      console.log('PWA: Service Worker registered successfully');

      // Handle service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });

      // Enable background sync if supported
      if (this.config.enableBackgroundSync && 'serviceWorker' in navigator) {
        try {
          // @ts-expect-error - Background sync is experimental
          await this.swRegistration.sync?.register('background-sync');
          console.log('PWA: Background sync enabled');
        } catch {
          console.warn('PWA: Background sync not supported');
        }
      }

    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
    }
  }

  // Setup install prompt handling
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as any;
      
      // Dispatch custom event for app to handle
      window.dispatchEvent(new CustomEvent('pwa-installable'));
      console.log('PWA: Install prompt available');
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
      console.log('PWA: App installed successfully');
    });
  }

  // Setup automatic update checks
  private setupUpdateChecks(): void {
    if (!this.swRegistration) return;

    this.updateCheckTimer = setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      window.dispatchEvent(new CustomEvent('pwa-online'));
      console.log('PWA: Network restored');
    });

    window.addEventListener('offline', () => {
      window.dispatchEvent(new CustomEvent('pwa-offline'));
      console.log('PWA: Network lost');
    });
  }

  // Public methods

  // Check if app can be installed
  public canInstall(): boolean {
    return this.installPrompt !== null;
  }

  // Show install prompt
  public async showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.installPrompt) {
      return 'unavailable';
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      this.installPrompt = null;
      return choice.outcome;
    } catch (error) {
      console.error('PWA: Install prompt error:', error);
      return 'dismissed';
    }
  }

  // Check for service worker updates
  public async checkForUpdates(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      await this.swRegistration.update();
      return true;
    } catch (error) {
      console.error('PWA: Update check failed:', error);
      return false;
    }
  }

  // Apply pending update
  public async applyUpdate(): Promise<void> {
    if (!this.swRegistration?.waiting) return;

    // Tell waiting service worker to skip waiting
    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page when new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    const permission = await Notification.requestPermission();
    console.log('PWA: Notification permission:', permission);
    return permission;
  }

  // Subscribe to push notifications
  public async subscribeToPush(vapidKey: string): Promise<PushSubscription | null> {
    if (!this.swRegistration || !this.config.enableNotifications) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      console.log('PWA: Push subscription created');
      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('PWA: Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA: Push unsubscription failed:', error);
      return false;
    }
  }

  // Get network status
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Get installation status
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches;
  }

  // Clean up
  public destroy(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }
  }

  // Private utility methods
  private showUpdateNotification(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available', {
      detail: {
        message: 'A new version of MelodicBook is available!',
        action: () => this.applyUpdate()
      }
    }));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// React hooks for PWA functionality
export function usePWA(config?: PWAConfig) {
  const [pwaManager] = useState(() => new PWAManager(config));
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleInstallable = () => setIsInstallable(true);
    const handleInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(pwaManager.isInstalled());
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdateAvailable = () => setUpdateAvailable(true);

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('pwa-online', handleOnline);
    window.addEventListener('pwa-offline', handleOffline);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Initial state
    setIsInstalled(pwaManager.isInstalled());
    setIsInstallable(pwaManager.canInstall());

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('pwa-online', handleOnline);
      window.removeEventListener('pwa-offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      pwaManager.destroy();
    };
  }, [pwaManager]);

  return {
    pwaManager,
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    install: () => pwaManager.showInstallPrompt(),
    applyUpdate: () => pwaManager.applyUpdate()
  };
}

// Utility functions
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}

export function isStandalone(): boolean {
  return getDisplayMode() !== 'browser';
}

// Default PWA manager instance
export const pwaManager = new PWAManager();
