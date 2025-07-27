import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';

// Touch gesture interfaces
interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

interface TouchGestureProps extends BoxProps {
  children: React.ReactNode;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPanStart?: (point: TouchPoint) => void;
  onPanMove?: (point: TouchPoint, delta: { x: number; y: number }) => void;
  onPanEnd?: (point: TouchPoint) => void;
  swipeThreshold?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  enableHapticFeedback?: boolean;
}

export const TouchGestures: React.FC<TouchGestureProps> = ({
  children,
  onSwipe,
  onPinch,
  onTap,
  onDoubleTap,
  onLongPress,
  onPanStart,
  onPanMove,
  onPanEnd,
  swipeThreshold = 50,
  doubleTapDelay = 300,
  longPressDelay = 500,
  enableHapticFeedback = true,
  ...boxProps
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const startTouchRef = useRef<TouchPoint | null>(null);
  const lastTouchRef = useRef<TouchPoint | null>(null);
  const tapTimeoutRef = useRef<number | undefined>(undefined);
  const longPressTimeoutRef = useRef<number | undefined>(undefined);
  const [isPanning, setIsPanning] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };

    navigator.vibrate(patterns[type]);
  }, [enableHapticFeedback]);

  // Touch point helper
  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), []);

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): SwipeGesture['direction'] => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, []);

  // Touch start handler
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const touchPoint = getTouchPoint(touch);
    
    startTouchRef.current = touchPoint;
    lastTouchRef.current = touchPoint;

    // Clear existing timeouts
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    // Long press detection
    if (onLongPress) {
      longPressTimeoutRef.current = window.setTimeout(() => {
        if (startTouchRef.current) {
          onLongPress(startTouchRef.current);
          triggerHapticFeedback('heavy');
        }
      }, longPressDelay);
    }

    // Pan start
    if (onPanStart) {
      onPanStart(touchPoint);
    }

    setIsPanning(true);
  }, [getTouchPoint, onLongPress, onPanStart, longPressDelay, triggerHapticFeedback]);

  // Touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startTouchRef.current || !lastTouchRef.current) return;

    const touch = e.touches[0];
    const currentPoint = getTouchPoint(touch);
    
    // Clear long press timeout on move
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = undefined;
    }

    // Pan move
    if (onPanMove && isPanning) {
      const delta = {
        x: currentPoint.x - lastTouchRef.current.x,
        y: currentPoint.y - lastTouchRef.current.y
      };
      onPanMove(currentPoint, delta);
    }

    // Pinch gesture (multi-touch)
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // You would need to track initial distance for scale calculation
      const scale = distance / 100; // Simplified scale calculation

      onPinch({ scale, center });
    }

    lastTouchRef.current = currentPoint;
  }, [getTouchPoint, onPanMove, onPinch, isPanning]);

  // Touch end handler
  const handleTouchEnd = useCallback((_e: TouchEvent) => {
    if (!startTouchRef.current || !lastTouchRef.current) return;

    const endPoint = lastTouchRef.current;
    const distance = getDistance(startTouchRef.current, endPoint);
    const duration = endPoint.timestamp - startTouchRef.current.timestamp;

    // Clear timeouts
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    // Pan end
    if (onPanEnd && isPanning) {
      onPanEnd(endPoint);
    }

    setIsPanning(false);

    // Swipe detection
    if (distance >= swipeThreshold && onSwipe) {
      const direction = getSwipeDirection(startTouchRef.current, endPoint);
      const velocity = distance / duration;
      
      const swipeGesture: SwipeGesture = {
        direction,
        distance,
        velocity,
        duration
      };

      onSwipe(swipeGesture);
      triggerHapticFeedback('medium');
    }
    // Tap detection (if not a swipe)
    else if (distance < swipeThreshold) {
      const now = Date.now();
      
      // Double tap detection
      if (onDoubleTap && (now - lastTapTime) < doubleTapDelay) {
        onDoubleTap(endPoint);
        triggerHapticFeedback('light');
        setLastTapTime(0); // Reset to prevent triple tap
      }
      // Single tap
      else if (onTap) {
        tapTimeoutRef.current = window.setTimeout(() => {
          onTap(endPoint);
          triggerHapticFeedback('light');
        }, doubleTapDelay);
        
        setLastTapTime(now);
      }
    }

    // Reset refs
    startTouchRef.current = null;
    lastTouchRef.current = null;
  }, [
    getDistance,
    getSwipeDirection,
    swipeThreshold,
    doubleTapDelay,
    lastTapTime,
    onSwipe,
    onTap,
    onDoubleTap,
    onPanEnd,
    isPanning,
    triggerHapticFeedback
  ]);

  // Attach touch event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      // Clear timeouts
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Box
      ref={elementRef}
      {...boxProps}
      css={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </Box>
  );
};

// Pull-to-refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxDistance?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxDistance = 120,
  refreshingText = '새로고침 중...',
  pullText = '아래로 당겨서 새로고침',
  releaseText = '손을 놓으면 새로고침'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const handlePanStart = useCallback((_point: TouchPoint) => {
    // Only start pull-to-refresh if at top of page
    if (window.scrollY === 0) {
      setCanRefresh(true);
    }
  }, []);

  const handlePanMove = useCallback((_point: TouchPoint, delta: { x: number; y: number }) => {
    if (!canRefresh || isRefreshing) return;

    // Only track downward movement
    if (delta.y > 0) {
      setPullDistance(prev => Math.min(prev + delta.y * 0.5, maxDistance));
    }
  }, [canRefresh, isRefreshing, maxDistance]);

  const handlePanEnd = useCallback(async () => {
    if (!canRefresh || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setCanRefresh(false);
  }, [canRefresh, isRefreshing, pullDistance, threshold, onRefresh]);

  const getStatusText = () => {
    if (isRefreshing) return refreshingText;
    if (pullDistance >= threshold) return releaseText;
    return pullText;
  };

  return (
    <Box position="relative">
      {/* Pull indicator */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height={`${pullDistance}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        color="gray.600"
        fontSize="sm"
        fontWeight="medium"
        transform={`translateY(-100%)`}
        transition="transform 0.2s ease"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance - maxDistance}px)` : 'translateY(-100%)'
        }}
      >
        {getStatusText()}
      </Box>

      <TouchGestures
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanEnd={handlePanEnd}
      >
        {children}
      </TouchGestures>
    </Box>
  );
};

export default TouchGestures;