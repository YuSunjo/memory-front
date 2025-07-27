import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

// PWA context and provider
interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installApp: () => Promise<void>;
  shareContent: (shareData: ShareData) => Promise<void>;
  isSupported: {
    notification: boolean;
    serviceWorker: boolean;
    share: boolean;
    installPrompt: boolean;
  };
  notification: {
    permission: NotificationPermission;
    requestPermission: () => Promise<NotificationPermission>;
    sendNotification: (title: string, options?: NotificationOptions) => void;
  };
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const toast = useToast();

  // Check PWA capabilities
  const isSupported = {
    notification: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    share: 'share' in navigator,
    installPrompt: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
  };

  // Check if app is already installed
  useEffect(() => {
    const checkInstallation = () => {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check for PWA launch (Android)
      const isPWA = (window.navigator as any).standalone === true || isStandalone;
      
      setIsInstalled(isPWA);
    };

    checkInstallation();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: '연결됨',
        description: '인터넷 연결이 복구되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '연결 끊김',
        description: '오프라인 모드로 전환되었습니다.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(beforeInstallPromptEvent);
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      toast({
        title: '설치 완료',
        description: 'Memory Front가 성공적으로 설치되었습니다!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  // Service Worker registration
  useEffect(() => {
    if (isSupported.serviceWorker) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          console.log('Service Worker registered:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: '업데이트 있음',
                    description: '새 버전이 사용 가능합니다. 새로고침하시겠습니까?',
                    status: 'info',
                    duration: 10000,
                    isClosable: true,
                  });
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerSW();
    }
  }, [isSupported.serviceWorker, toast]);

  // Notification permission handling
  useEffect(() => {
    if (isSupported.notification) {
      setNotificationPermission(Notification.permission);
    }
  }, [isSupported.notification]);

  // Install app function
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      toast({
        title: '설치 불가',
        description: '앱 설치가 현재 불가능합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during app installation:', error);
      toast({
        title: '설치 오류',
        description: '앱 설치 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [deferredPrompt, toast]);

  // Share content function
  const shareContent = useCallback(async (shareData: ShareData) => {
    if (isSupported.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        
        // Fallback to clipboard
        if ('clipboard' in navigator && shareData.url) {
          await navigator.clipboard.writeText(shareData.url);
          toast({
            title: '링크 복사됨',
            description: '공유 링크가 클립보드에 복사되었습니다.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } else {
      // Fallback for unsupported browsers
      if ('clipboard' in navigator && shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: '링크 복사됨',
          description: '공유 링크가 클립보드에 복사되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [isSupported.share, toast]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported.notification) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported.notification]);

  // Send notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported.notification || notificationPermission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'memory-front',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported.notification, notificationPermission]);

  const contextValue: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    installPrompt,
    deferredPrompt,
    installApp,
    shareContent,
    isSupported,
    notification: {
      permission: notificationPermission,
      requestPermission: requestNotificationPermission,
      sendNotification
    }
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};

// Hook for offline storage
export const useOfflineStorage = () => {
  const { isOnline } = usePWA();

  const storeOfflineData = useCallback(async (key: string, data: any) => {
    try {
      if ('indexedDB' in window) {
        // Use IndexedDB for complex data
        const dbName = 'MemoryFrontOffline';
        const request = indexedDB.open(dbName, 1);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('offline-data')) {
            db.createObjectStore('offline-data');
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['offline-data'], 'readwrite');
          const store = transaction.objectStore('offline-data');
          store.put(data, key);
        };
      } else {
        // Fallback to localStorage
        localStorage.setItem(`offline-${key}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }, []);

  const getOfflineData = useCallback(async (key: string) => {
    try {
      if ('indexedDB' in window) {
        return new Promise((resolve) => {
          const dbName = 'MemoryFrontOffline';
          const request = indexedDB.open(dbName, 1);
          
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['offline-data'], 'readonly');
            const store = transaction.objectStore('offline-data');
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => {
              resolve(getRequest.result);
            };
          };
        });
      } else {
        // Fallback to localStorage
        const data = localStorage.getItem(`offline-${key}`);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }, []);

  return {
    isOnline,
    storeOfflineData,
    getOfflineData
  };
};

export default PWAProvider;