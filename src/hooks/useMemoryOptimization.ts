import React, { useEffect, useCallback, useRef } from 'react';

/**
 * Memory Optimization Hook
 * 
 * Provides utilities for memory management, cleanup, and performance monitoring
 */

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

interface UseMemoryOptimizationOptions {
  enableMonitoring?: boolean;
  cleanupInterval?: number;
  memoryThreshold?: number;
  onMemoryWarning?: (stats: MemoryStats) => void;
  onMemoryCleanup?: () => void;
}

export const useMemoryOptimization = (options: UseMemoryOptimizationOptions = {}) => {
  const {
    enableMonitoring = true,
    cleanupInterval = 30000, // 30 seconds
    memoryThreshold = 0.8, // 80%
    onMemoryWarning,
    onMemoryCleanup
  } = options;

  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const intervalRef = useRef<number | undefined>(undefined);
  const observersRef = useRef<(IntersectionObserver | MutationObserver | ResizeObserver)[]>([]);
  const eventListenersRef = useRef<{ element: Element | Window; event: string; handler: EventListener }[]>([]);

  // Get current memory usage
  const getMemoryStats = useCallback((): MemoryStats | null => {
    if (!('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const usagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage
    };
  }, []);

  // Register cleanup function
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
    
    return () => {
      const index = cleanupFunctionsRef.current.indexOf(cleanupFn);
      if (index > -1) {
        cleanupFunctionsRef.current.splice(index, 1);
      }
    };
  }, []);

  // Register observer for automatic cleanup
  const registerObserver = useCallback((observer: IntersectionObserver | MutationObserver | ResizeObserver) => {
    observersRef.current.push(observer);
    
    return () => {
      const index = observersRef.current.indexOf(observer);
      if (index > -1) {
        observer.disconnect();
        observersRef.current.splice(index, 1);
      }
    };
  }, []);

  // Register event listener for automatic cleanup
  const registerEventListener = useCallback((
    element: Element | Window,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    
    const listenerData = { element, event, handler };
    eventListenersRef.current.push(listenerData);
    
    return () => {
      element.removeEventListener(event, handler);
      const index = eventListenersRef.current.indexOf(listenerData);
      if (index > -1) {
        eventListenersRef.current.splice(index, 1);
      }
    };
  }, []);

  // Force garbage collection (if available)
  const forceGarbageCollection = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Trigger cleanup functions
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    
    onMemoryCleanup?.();
  }, [onMemoryCleanup]);

  // Memory monitoring
  const monitorMemory = useCallback(() => {
    const stats = getMemoryStats();
    if (!stats) return;

    if (stats.usagePercentage > memoryThreshold) {
      console.warn('Memory usage high:', `${(stats.usagePercentage * 100).toFixed(1)}%`);
      onMemoryWarning?.(stats);
      
      // Auto-cleanup on high memory usage
      forceGarbageCollection();
    }
  }, [getMemoryStats, memoryThreshold, onMemoryWarning, forceGarbageCollection]);

  // Cleanup all resources
  const cleanupAll = useCallback(() => {
    // Cleanup registered functions
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctionsRef.current = [];

    // Disconnect observers
    observersRef.current.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Observer disconnect failed:', error);
      }
    });
    observersRef.current = [];

    // Remove event listeners
    eventListenersRef.current.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        console.warn('Event listener removal failed:', error);
      }
    });
    eventListenersRef.current = [];

    // Clear monitoring interval
    if (intervalRef.current !== undefined) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Setup memory monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    intervalRef.current = window.setInterval(monitorMemory, cleanupInterval);

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [enableMonitoring, cleanupInterval, monitorMemory]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupAll;
  }, [cleanupAll]);

  return {
    getMemoryStats,
    registerCleanup,
    registerObserver,
    registerEventListener,
    forceGarbageCollection,
    cleanupAll,
    monitorMemory
  };
};

// HOC for automatic memory cleanup
export const withMemoryOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options?: UseMemoryOptimizationOptions
): React.ComponentType<P> => {
  const MemoryOptimizedComponent: React.FC<P> = (props) => {
    useMemoryOptimization(options);
    return React.createElement(Component, props);
  };
  
  return MemoryOptimizedComponent as React.ComponentType<P>;
};

// Hook for image cache management
export const useImageCacheManager = () => {
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const maxCacheSize = 50;

  const addToCache = useCallback((src: string, img: HTMLImageElement) => {
    if (cacheRef.current.size >= maxCacheSize) {
      // Remove oldest entry
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) {
        const oldImg = cacheRef.current.get(firstKey);
        if (oldImg) {
          oldImg.src = '';
          oldImg.onload = null;
          oldImg.onerror = null;
        }
        cacheRef.current.delete(firstKey);
      }
    }
    
    cacheRef.current.set(src, img);
  }, []);

  const getFromCache = useCallback((src: string) => {
    return cacheRef.current.get(src);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.forEach(img => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
    });
    cacheRef.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size;
  }, []);

  useEffect(() => {
    return clearCache;
  }, [clearCache]);

  return {
    addToCache,
    getFromCache,
    clearCache,
    getCacheSize,
    maxCacheSize
  };
};

// Hook for DOM node cleanup
export const useDOMCleanup = () => {
  const nodesRef = useRef<Set<Element>>(new Set());

  const registerNode = useCallback((node: Element) => {
    nodesRef.current.add(node);
    
    return () => {
      nodesRef.current.delete(node);
    };
  }, []);

  const cleanupNodes = useCallback(() => {
    nodesRef.current.forEach(node => {
      try {
        // Remove data attributes
        Array.from(node.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            node.removeAttribute(attr.name);
          }
        });
        
        // Clear innerHTML for content cleanup
        if (node.children.length === 0) {
          node.innerHTML = '';
        }
      } catch (error) {
        console.warn('Node cleanup failed:', error);
      }
    });
    
    nodesRef.current.clear();
  }, []);

  useEffect(() => {
    return cleanupNodes;
  }, [cleanupNodes]);

  return {
    registerNode,
    cleanupNodes,
    nodeCount: nodesRef.current.size
  };
};

export default useMemoryOptimization;