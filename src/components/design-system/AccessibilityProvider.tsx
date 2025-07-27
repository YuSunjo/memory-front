import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Accessibility context and provider
interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announceToScreenReader: (message: string) => void;
  setFocusManagement: (enabled: boolean) => void;
}

const defaultConfig: AccessibilityConfig = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusVisible: true,
  screenReader: false,
  keyboardNavigation: false
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AccessibilityConfig>(defaultConfig);

  // Detect user preferences
  useEffect(() => {
    const detectPreferences = () => {
      const updates: Partial<AccessibilityConfig> = {};

      // Detect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updates.reducedMotion = true;
      }

      // Detect prefers-contrast
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        updates.highContrast = true;
      }

      // Detect screen reader
      const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
                              window.navigator.userAgent.includes('JAWS') ||
                              window.speechSynthesis ||
                              'speechSynthesis' in window;
      
      if (hasScreenReader) {
        updates.screenReader = true;
      }

      // Apply detected preferences
      if (Object.keys(updates).length > 0) {
        setConfig(prev => ({ ...prev, ...updates }));
      }
    };

    detectPreferences();

    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply CSS custom properties based on config
    root.style.setProperty('--motion-duration', config.reducedMotion ? '0ms' : '300ms');
    root.style.setProperty('--motion-easing', config.reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)');
    
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (config.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (config.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

  }, [config]);

  // Keyboard navigation detection
  useEffect(() => {
    let keyboardUsed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Common keyboard navigation keys
      const navKeys = ['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      
      if (navKeys.includes(e.key)) {
        keyboardUsed = true;
        setConfig(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      if (keyboardUsed) {
        // User switched to mouse, reduce keyboard emphasis
        setConfig(prev => ({ ...prev, keyboardNavigation: false }));
        keyboardUsed = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const setFocusManagement = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, focusVisible: enabled }));
  }, []);

  const contextValue: AccessibilityContextType = {
    config,
    updateConfig,
    announceToScreenReader,
    setFocusManagement
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook for focus management
export const useFocusManagement = () => {
  const { config } = useAccessibility();

  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const restoreFocus = useCallback((previousElement: HTMLElement | null) => {
    if (previousElement && config.focusVisible) {
      previousElement.focus();
    }
  }, [config.focusVisible]);

  return {
    trapFocus,
    restoreFocus,
    focusVisible: config.focusVisible
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const { announceToScreenReader, config } = useAccessibility();

  const announce = useCallback((message: string, _priority: 'polite' | 'assertive' = 'polite') => {
    if (config.screenReader) {
      announceToScreenReader(message);
    }
  }, [announceToScreenReader, config.screenReader]);

  return {
    announce,
    isScreenReaderActive: config.screenReader
  };
};

// Hook for motion preferences
export const useMotionPreference = () => {
  const { config } = useAccessibility();

  return {
    reducedMotion: config.reducedMotion,
    getAnimationDuration: (defaultDuration: number) => 
      config.reducedMotion ? 0 : defaultDuration,
    getTransitionStyle: (transition: string) => 
      config.reducedMotion ? 'none' : transition
  };
};

export default AccessibilityProvider;