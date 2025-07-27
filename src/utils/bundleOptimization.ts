/**
 * Bundle Optimization Utilities
 * 
 * Provides utilities for code splitting, lazy loading, and bundle analysis
 */

import { lazy, type ComponentType } from 'react';

// Route-based code splitting helper
export const createLazyRoute = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  _fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return LazyComponent;
};

// Dynamic import with error handling and retry
export const dynamicImport = async <T>(
  importFunc: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
};

// Chunk loading progress tracker
export class ChunkLoadingTracker {
  private loadingChunks = new Set<string>();
  private loadedChunks = new Set<string>();
  private failedChunks = new Set<string>();
  private listeners: ((progress: ChunkProgress) => void)[] = [];

  addListener(listener: (progress: ChunkProgress) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  startLoading(chunkName: string) {
    this.loadingChunks.add(chunkName);
    this.notifyListeners();
  }

  finishLoading(chunkName: string, success: boolean) {
    this.loadingChunks.delete(chunkName);
    
    if (success) {
      this.loadedChunks.add(chunkName);
    } else {
      this.failedChunks.add(chunkName);
    }
    
    this.notifyListeners();
  }

  private notifyListeners() {
    const progress: ChunkProgress = {
      loading: this.loadingChunks.size,
      loaded: this.loadedChunks.size,
      failed: this.failedChunks.size,
      total: this.loadingChunks.size + this.loadedChunks.size + this.failedChunks.size
    };

    this.listeners.forEach(listener => listener(progress));
  }

  getProgress(): ChunkProgress {
    return {
      loading: this.loadingChunks.size,
      loaded: this.loadedChunks.size,
      failed: this.failedChunks.size,
      total: this.loadingChunks.size + this.loadedChunks.size + this.failedChunks.size
    };
  }
}

export interface ChunkProgress {
  loading: number;
  loaded: number;
  failed: number;
  total: number;
}

// Global chunk tracker instance
export const chunkTracker = new ChunkLoadingTracker();

// Preload route chunks strategically
export const preloadRouteChunk = async (routeName: string) => {
  const chunkName = `route-${routeName}`;
  
  try {
    chunkTracker.startLoading(chunkName);
    
    // Dynamic route imports based on route name
    const routeMap: Record<string, () => Promise<any>> = {
      'home': () => import('../pages/HomePage'),
      'profile': () => import('../pages/ProfilePage'),
      'memories': () => import('../pages/MyMemoriesPage'),
      'create-memory': () => import('../pages/CreateMemoryPage'),
      'memory-quest': () => import('../pages/MemoryQuestPage'),
      'calendar': () => import('../pages/CalendarPage'),
      'relationship': () => import('../pages/RelationshipPage'),
      'sharing-memories': () => import('../pages/SharingMemoriesPage'),
    };

    const importFunc = routeMap[routeName];
    if (!importFunc) {
      throw new Error(`Route ${routeName} not found`);
    }

    await dynamicImport(importFunc);
    chunkTracker.finishLoading(chunkName, true);
  } catch (error) {
    console.error(`Failed to preload route ${routeName}:`, error);
    chunkTracker.finishLoading(chunkName, false);
  }
};

// Bundle size analyzer for development
export const analyzeBundleSize = () => {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const performance = (window as any).performance;
  if (!performance || !performance.getEntriesByType) {
    console.warn('Performance API not available');
    return;
  }

  const navigationEntries = performance.getEntriesByType('navigation');
  const resourceEntries = performance.getEntriesByType('resource');

  const jsResources = resourceEntries.filter((entry: any) => 
    entry.name.includes('.js') && !entry.name.includes('hot-update')
  );

  const cssResources = resourceEntries.filter((entry: any) => 
    entry.name.includes('.css')
  );

  const totalJSSize = jsResources.reduce((total: number, entry: any) => 
    total + (entry.transferSize || 0), 0
  );

  const totalCSSSize = cssResources.reduce((total: number, entry: any) => 
    total + (entry.transferSize || 0), 0
  );

  console.group('📦 Bundle Analysis');
  console.log('JavaScript resources:', jsResources.length);
  console.log('CSS resources:', cssResources.length);
  console.log('Total JS size:', formatBytes(totalJSSize));
  console.log('Total CSS size:', formatBytes(totalCSSSize));
  console.log('Total bundle size:', formatBytes(totalJSSize + totalCSSSize));
  
  if (navigationEntries.length > 0) {
    const nav = navigationEntries[0] as any;
    console.log('DOM Content Loaded:', `${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`);
    console.log('Load Complete:', `${nav.loadEventEnd - nav.loadEventStart}ms`);
  }
  
  console.groupEnd();
};

// Format bytes utility
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Critical resource preloader
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Design system CSS
    '/src/theme/tokens.ts',
    // Core components
    '/src/components/design-system/index.ts',
    // Essential hooks
    '/src/hooks/useAuth.ts',
    '/src/store/memberStore.ts'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Analyze chunk dependencies
export const analyzeChunkDependencies = () => {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const moduleMap = new Map<string, string[]>();
  
  // Analyze import dependencies (simplified for demo)
  const analyzeModule = (moduleName: string, dependencies: string[]) => {
    moduleMap.set(moduleName, dependencies);
  };

  // Example dependency mapping
  analyzeModule('HomePage', ['GoogleMap', 'ResponsiveUpcomingEvents', 'design-system']);
  analyzeModule('CreateMemoryPage', ['design-system', 'calendar', 'file-upload']);
  analyzeModule('MemoryQuestPage', ['design-system', 'memory-service']);

  console.group('🔗 Chunk Dependencies');
  moduleMap.forEach((deps, module) => {
    console.log(`${module}:`, deps.join(', '));
  });
  console.groupEnd();

  return moduleMap;
};

export default {
  createLazyRoute,
  dynamicImport,
  chunkTracker,
  preloadRouteChunk,
  analyzeBundleSize,
  preloadCriticalResources,
  analyzeChunkDependencies
};