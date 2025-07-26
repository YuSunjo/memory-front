import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Advanced Caching Strategy Hook
 * 
 * Provides intelligent caching with TTL, LRU eviction, and memory-aware storage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheConfig {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  maxMemoryUsage?: number; // Max memory usage in bytes
  enablePersistence?: boolean;
  persistenceKey?: string;
  enableCompression?: boolean;
  onEvict?: (key: string, value: any) => void;
  onError?: (error: Error) => void;
}

interface CacheStats {
  size: number;
  memoryUsage: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
}

export const useCacheStrategy = <T = any>(config: CacheConfig = {}) => {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000, // 5 minutes
    maxMemoryUsage = 10 * 1024 * 1024, // 10MB
    enablePersistence = false,
    persistenceKey = 'app-cache',
    enableCompression = false,
    onEvict,
    onError
  } = config;

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const statsRef = useRef<CacheStats>({
    size: 0,
    memoryUsage: 0,
    hitRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0
  });

  const [stats, setStats] = useState<CacheStats>(statsRef.current);

  // Calculate approximate size of data
  const calculateSize = useCallback((data: T): number => {
    try {
      const serialized = JSON.stringify(data);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }, []);

  // Update statistics
  const updateStats = useCallback(() => {
    const cache = cacheRef.current;
    const newStats: CacheStats = {
      size: cache.size,
      memoryUsage: Array.from(cache.values()).reduce((total, entry) => total + entry.size, 0),
      hitRate: statsRef.current.totalRequests > 0 
        ? statsRef.current.totalHits / statsRef.current.totalRequests 
        : 0,
      totalRequests: statsRef.current.totalRequests,
      totalHits: statsRef.current.totalHits,
      totalMisses: statsRef.current.totalMisses
    };

    statsRef.current = newStats;
    setStats(newStats);
  }, []);

  // LRU eviction strategy
  const evictLRU = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const evictedEntry = cache.get(oldestKey);
      cache.delete(oldestKey);
      
      if (evictedEntry && onEvict) {
        onEvict(oldestKey, evictedEntry.data);
      }
    }
  }, [onEvict]);

  // Memory-based eviction
  const evictByMemory = useCallback(() => {
    const cache = cacheRef.current;
    const currentMemory = Array.from(cache.values()).reduce((total, entry) => total + entry.size, 0);
    
    if (currentMemory <= maxMemoryUsage) return;

    // Sort by access frequency and recency (LFU + LRU hybrid)
    const entries = Array.from(cache.entries()).sort(([, a], [, b]) => {
      const scoreA = a.accessCount / (Date.now() - a.lastAccessed + 1);
      const scoreB = b.accessCount / (Date.now() - b.lastAccessed + 1);
      return scoreA - scoreB;
    });

    // Remove entries until under memory limit
    let memoryUsage = currentMemory;
    for (const [key, entry] of entries) {
      if (memoryUsage <= maxMemoryUsage) break;
      
      cache.delete(key);
      memoryUsage -= entry.size;
      
      if (onEvict) {
        onEvict(key, entry.data);
      }
    }
  }, [maxMemoryUsage, onEvict]);

  // TTL cleanup
  const cleanupExpired = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      const entry = cache.get(key);
      cache.delete(key);
      
      if (entry && onEvict) {
        onEvict(key, entry.data);
      }
    });

    return expiredKeys.length;
  }, [ttl, onEvict]);

  // Compress data if enabled
  const compressData = useCallback(async (data: T): Promise<T> => {
    if (!enableCompression) return data;
    
    try {
      // Simple compression simulation - in real app, use actual compression library
      const serialized = JSON.stringify(data);
      if (serialized.length > 1000) {
        // Placeholder for actual compression
        return data;
      }
      return data;
    } catch (error) {
      onError?.(error as Error);
      return data;
    }
  }, [enableCompression, onError]);

  // Decompress data if enabled
  const decompressData = useCallback(async (data: T): Promise<T> => {
    if (!enableCompression) return data;
    
    try {
      // Placeholder for actual decompression
      return data;
    } catch (error) {
      onError?.(error as Error);
      return data;
    }
  }, [enableCompression, onError]);

  // Set cache entry
  const set = useCallback(async (key: string, data: T): Promise<void> => {
    try {
      const cache = cacheRef.current;
      const compressedData = await compressData(data);
      const size = calculateSize(compressedData);
      const now = Date.now();

      const entry: CacheEntry<T> = {
        data: compressedData,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now,
        size
      };

      // Check if we need to evict
      if (cache.size >= maxSize) {
        evictLRU();
      }

      cache.set(key, entry);
      evictByMemory();
      updateStats();

      // Persist to localStorage if enabled
      if (enablePersistence) {
        try {
          const persistData = Array.from(cache.entries()).reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
          }, {} as Record<string, CacheEntry<T>>);
          
          localStorage.setItem(persistenceKey, JSON.stringify(persistData));
        } catch (error) {
          onError?.(error as Error);
        }
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [
    compressData,
    calculateSize,
    maxSize,
    evictLRU,
    evictByMemory,
    updateStats,
    enablePersistence,
    persistenceKey,
    onError
  ]);

  // Get cache entry
  const get = useCallback(async (key: string): Promise<T | null> => {
    const cache = cacheRef.current;
    statsRef.current.totalRequests++;

    const entry = cache.get(key);
    if (!entry) {
      statsRef.current.totalMisses++;
      updateStats();
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      statsRef.current.totalMisses++;
      updateStats();
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    statsRef.current.totalHits++;
    updateStats();

    return await decompressData(entry.data);
  }, [ttl, updateStats, decompressData]);

  // Check if key exists and is valid
  const has = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) return false;
    
    // Check TTL
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return false;
    }
    
    return true;
  }, [ttl]);

  // Delete entry
  const del = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const result = cache.delete(key);
    updateStats();
    return result;
  }, [updateStats]);

  // Clear all cache
  const clear = useCallback(() => {
    cacheRef.current.clear();
    statsRef.current = {
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0
    };
    updateStats();

    if (enablePersistence) {
      try {
        localStorage.removeItem(persistenceKey);
      } catch (error) {
        onError?.(error as Error);
      }
    }
  }, [updateStats, enablePersistence, persistenceKey, onError]);

  // Get all keys
  const keys = useCallback((): string[] => {
    return Array.from(cacheRef.current.keys());
  }, []);

  // Bulk operations
  const mget = useCallback(async (keys: string[]): Promise<(T | null)[]> => {
    return Promise.all(keys.map(key => get(key)));
  }, [get]);

  const mset = useCallback(async (entries: Array<[string, T]>): Promise<void> => {
    await Promise.all(entries.map(([key, value]) => set(key, value)));
  }, [set]);

  // Load from persistence on mount
  useEffect(() => {
    if (!enablePersistence) return;

    try {
      const stored = localStorage.getItem(persistenceKey);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, CacheEntry<T>>;
        const cache = cacheRef.current;
        
        Object.entries(data).forEach(([key, entry]) => {
          // Check if entry is still valid
          if (Date.now() - entry.timestamp <= ttl) {
            cache.set(key, entry);
          }
        });
        
        updateStats();
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [enablePersistence, persistenceKey, ttl, updateStats, onError]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpired();
      updateStats();
    }, ttl / 2);

    return () => clearInterval(interval);
  }, [cleanupExpired, updateStats, ttl]);

  return {
    set,
    get,
    has,
    del,
    clear,
    keys,
    mget,
    mset,
    stats,
    cleanupExpired,
    evictLRU,
    evictByMemory
  };
};

// Hook for API response caching
export const useAPICache = (baseConfig?: CacheConfig) => {
  const cache = useCacheStrategy<any>({
    maxSize: 200,
    ttl: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true,
    persistenceKey: 'api-cache',
    ...baseConfig
  });

  const cacheKey = useCallback((url: string, params?: any): string => {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramStr}`;
  }, []);

  const cachedFetch = useCallback(async <T>(
    url: string,
    options?: RequestInit,
    params?: any
  ): Promise<T> => {
    const key = cacheKey(url, { ...options, ...params });
    
    // Try cache first
    const cached = await cache.get(key);
    if (cached) {
      return cached as T;
    }

    // Fetch from API
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the response
    await cache.set(key, data);
    
    return data as T;
  }, [cache, cacheKey]);

  return {
    ...cache,
    cachedFetch,
    cacheKey
  };
};

export default useCacheStrategy;