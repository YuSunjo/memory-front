import { useState, useCallback } from 'react';

interface UseImagePreloaderOptions {
  threshold?: number;
  quality?: number;
  enableWebP?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface PreloadResult {
  success: boolean;
  error?: string;
  loadTime?: number;
}

export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const {
    quality = 80,
    enableWebP = true,
    retryAttempts = 2,
    retryDelay = 1000
  } = options;

  const [preloadCache, setPreloadCache] = useState<Map<string, PreloadResult>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);

  // Generate optimized image URL
  const getOptimizedUrl = useCallback((src: string): string => {
    if (!enableWebP || !src || src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }

    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}quality=${quality}&format=webp`;
  }, [enableWebP, quality]);

  // Preload single image with retry logic
  const preloadImage = useCallback(async (src: string, attempts = 0): Promise<PreloadResult> => {
    const startTime = performance.now();
    const optimizedSrc = getOptimizedUrl(src);

    // Check cache first
    const cached = preloadCache.get(optimizedSrc);
    if (cached) {
      return cached;
    }

    return new Promise((resolve) => {
      const img = new Image();
      
      const onLoad = () => {
        const loadTime = performance.now() - startTime;
        const result: PreloadResult = { success: true, loadTime };
        
        setPreloadCache(prev => new Map(prev).set(optimizedSrc, result));
        resolve(result);
      };

      const onError = async () => {
        if (attempts < retryAttempts) {
          // Retry with exponential backoff
          setTimeout(() => {
            preloadImage(src, attempts + 1).then(resolve);
          }, retryDelay * Math.pow(2, attempts));
        } else {
          const result: PreloadResult = { 
            success: false, 
            error: 'Failed to load image after retries'
          };
          
          setPreloadCache(prev => new Map(prev).set(optimizedSrc, result));
          resolve(result);
        }
      };

      img.onload = onLoad;
      img.onerror = onError;
      img.src = optimizedSrc;
    });
  }, [getOptimizedUrl, preloadCache, retryAttempts, retryDelay]);

  // Preload multiple images with priority queue
  const preloadImages = useCallback(async (
    images: string[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<PreloadResult[]> => {
    if (images.length === 0) return [];

    setIsPreloading(true);
    const results: PreloadResult[] = [];
    let completed = 0;

    try {
      // Process images in batches to avoid overwhelming the browser
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < images.length; i += batchSize) {
        batches.push(images.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (src) => {
          const result = await preloadImage(src);
          completed++;
          onProgress?.(completed, images.length);
          return result;
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results;
    } finally {
      setIsPreloading(false);
    }
  }, [preloadImage]);

  // Priority preloader for critical images
  const preloadCriticalImages = useCallback(async (images: string[]): Promise<void> => {
    const criticalImages = images.slice(0, 3); // First 3 images are critical
    await Promise.all(criticalImages.map(src => preloadImage(src)));
  }, [preloadImage]);

  // Check if image is already cached
  const isImageCached = useCallback((src: string): boolean => {
    const optimizedSrc = getOptimizedUrl(src);
    const cached = preloadCache.get(optimizedSrc);
    return cached?.success === true;
  }, [getOptimizedUrl, preloadCache]);

  // Get cached image result
  const getCachedResult = useCallback((src: string): PreloadResult | undefined => {
    const optimizedSrc = getOptimizedUrl(src);
    return preloadCache.get(optimizedSrc);
  }, [getOptimizedUrl, preloadCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    setPreloadCache(new Map());
  }, []);

  // Cache stats
  const getCacheStats = useCallback(() => {
    const entries = Array.from(preloadCache.values());
    const successful = entries.filter(result => result.success).length;
    const failed = entries.filter(result => !result.success).length;
    const avgLoadTime = entries
      .filter(result => result.success && result.loadTime)
      .reduce((sum, result) => sum + (result.loadTime || 0), 0) / successful || 0;

    return {
      total: entries.length,
      successful,
      failed,
      avgLoadTime: Math.round(avgLoadTime),
      cacheSize: preloadCache.size
    };
  }, [preloadCache]);

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    isImageCached,
    getCachedResult,
    clearCache,
    getCacheStats,
    isPreloading,
    cacheSize: preloadCache.size
  };
};

export default useImagePreloader;