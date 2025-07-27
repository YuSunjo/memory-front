import React, { useEffect, useRef, useCallback } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { useAccessibility } from './AccessibilityProvider';
import { designTokens } from '../../theme/tokens';

// Enhanced keyboard navigation component
interface KeyboardNavigationProps extends BoxProps {
  children: React.ReactNode;
  enableArrowKeys?: boolean;
  enableHomeEnd?: boolean;
  enableTypeAhead?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end') => void;
  onActivate?: (element: HTMLElement) => void;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  enableArrowKeys = true,
  enableHomeEnd = true,
  enableTypeAhead = false,
  orientation = 'both',
  onNavigate,
  onActivate,
  ...boxProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config } = useAccessibility();
  const typeAheadTimeoutRef = useRef<number | undefined>(undefined);
  const typeAheadStringRef = useRef('');

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]:not([aria-disabled="true"])',
      '[role="menuitem"]:not([aria-disabled="true"])',
      '[role="option"]:not([aria-disabled="true"])'
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelector)) as HTMLElement[];
  }, []);

  const getCurrentIndex = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    return elements.indexOf(activeElement);
  }, [getFocusableElements]);

  const focusElementAt = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      return elements[index];
    }
    return null;
  }, [getFocusableElements]);

  const getNextIndex = useCallback((currentIndex: number, direction: 'next' | 'prev') => {
    const elements = getFocusableElements();
    const length = elements.length;
    
    if (length === 0) return -1;
    
    if (direction === 'next') {
      return (currentIndex + 1) % length;
    } else {
      return currentIndex <= 0 ? length - 1 : currentIndex - 1;
    }
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!config.keyboardNavigation || !enableArrowKeys) return;

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) return;

    let handled = false;
    let direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | null = null;

    switch (e.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          const prevIndex = getNextIndex(currentIndex, 'prev');
          focusElementAt(prevIndex);
          direction = 'up';
          handled = true;
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          const nextIndex = getNextIndex(currentIndex, 'next');
          focusElementAt(nextIndex);
          direction = 'down';
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          const prevIndex = getNextIndex(currentIndex, 'prev');
          focusElementAt(prevIndex);
          direction = 'left';
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          const nextIndex = getNextIndex(currentIndex, 'next');
          focusElementAt(nextIndex);
          direction = 'right';
          handled = true;
        }
        break;

      case 'Home':
        if (enableHomeEnd) {
          focusElementAt(0);
          direction = 'home';
          handled = true;
        }
        break;

      case 'End':
        if (enableHomeEnd) {
          const elements = getFocusableElements();
          focusElementAt(elements.length - 1);
          direction = 'end';
          handled = true;
        }
        break;

      case 'Enter':
      case ' ':
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && onActivate) {
          onActivate(activeElement);
          handled = true;
        }
        break;

      default:
        // Type-ahead functionality
        if (enableTypeAhead && e.key.length === 1) {
          clearTimeout(typeAheadTimeoutRef.current);
          typeAheadStringRef.current += e.key.toLowerCase();
          
          const elements = getFocusableElements();
          const matchingElement = elements.find(element => {
            const text = element.textContent?.toLowerCase() || '';
            return text.startsWith(typeAheadStringRef.current);
          });

          if (matchingElement) {
            matchingElement.focus();
            handled = true;
          }

          typeAheadTimeoutRef.current = window.setTimeout(() => {
            typeAheadStringRef.current = '';
          }, 1000);
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      
      if (direction && onNavigate) {
        onNavigate(direction);
      }
    }
  }, [
    config.keyboardNavigation,
    enableArrowKeys,
    enableHomeEnd,
    enableTypeAhead,
    orientation,
    getCurrentIndex,
    getNextIndex,
    focusElementAt,
    getFocusableElements,
    onNavigate,
    onActivate
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return (
    <Box
      ref={containerRef}
      role="group"
      {...boxProps}
      css={{
        // Enhanced focus indicators for keyboard navigation
        '& *:focus-visible': {
          outline: `2px solid ${designTokens.colors.brand.primary}`,
          outlineOffset: '2px',
          borderRadius: designTokens.borderRadius.sm,
        },
        // High contrast focus indicator
        '@media (prefers-contrast: high)': {
          '& *:focus-visible': {
            outline: `3px solid ${designTokens.colors.brand.primary}`,
            outlineOffset: '3px',
          }
        }
      }}
    >
      {children}
    </Box>
  );
};

// Skip link component for keyboard navigation
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Box
      as="a"
      href={href}
      position="absolute"
      left="-9999px"
      zIndex="skipLink"
      bg="white"
      color="black"
      p={2}
      textDecoration="none"
      border="2px solid"
      borderColor="black"
      borderRadius="md"
      _focus={{
        left: '10px',
        top: '10px'
      }}
      css={{
        '&:focus': {
          left: '10px !important',
          top: '10px !important'
        }
      }}
    >
      {children}
    </Box>
  );
};

// Roving tabindex component for better keyboard navigation
interface RovingTabIndexProps {
  children: React.ReactNode;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const RovingTabIndex: React.FC<RovingTabIndexProps> = ({
  children,
  defaultIndex = 0,
  onIndexChange
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(defaultIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateTabIndex = useCallback((activeIndex: number) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]');
    
    focusableElements.forEach((element, index) => {
      if (index === activeIndex) {
        element.setAttribute('tabindex', '0');
      } else {
        element.setAttribute('tabindex', '-1');
      }
    });
  }, []);

  useEffect(() => {
    updateTabIndex(currentIndex);
  }, [currentIndex, updateTabIndex]);

  const handleFocus = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current) return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll('[role="tab"], [role="option"], [role="menuitem"]')
    );
    
    const newIndex = focusableElements.indexOf(e.target as Element);
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, onIndexChange]);

  return (
    <Box ref={containerRef} onFocus={handleFocus}>
      {children}
    </Box>
  );
};

export default KeyboardNavigation;