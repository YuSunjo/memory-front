import React, { useState, useRef, useEffect } from 'react';
import { Box, Image, Skeleton, Alert, AlertIcon } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'eager' | 'lazy';
  enableWebP?: boolean;
  quality?: number;
  placeholder?: 'skeleton' | 'blur' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  width = '100%',
  height = 'auto',
  borderRadius = 'md',
  objectFit = 'cover',
  loading = 'lazy',
  enableWebP = true,
  quality = 80,
  placeholder = 'skeleton',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loading]);

  // Generate optimized image URL with WebP support
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!enableWebP || !originalSrc) return originalSrc;
    
    // Check if it's a data URL or external URL
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Add quality parameter for internal images
    const separator = originalSrc.includes('?') ? '&' : '?';
    return `${originalSrc}${separator}quality=${quality}&format=webp`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  const shouldShowPlaceholder = !isLoaded && !hasError && placeholder !== 'none';
  const shouldShowImage = isInView && !hasError;

  return (
    <Box
      ref={imgRef}
      position="relative"
      width={width}
      height={height}
      borderRadius={borderRadius}
      overflow="hidden"
      {...props}
    >
      {/* Skeleton Placeholder */}
      {shouldShowPlaceholder && placeholder === 'skeleton' && (
        <Skeleton
          width="100%"
          height={height}
          borderRadius={borderRadius}
          speed={1.2}
          startColor={designTokens.colors.glass.backgroundLight}
          endColor={designTokens.colors.glass.background}
        />
      )}

      {/* Blur Placeholder */}
      {shouldShowPlaceholder && placeholder === 'blur' && (
        <Box
          width="100%"
          height={height}
          bg={designTokens.colors.glass.backgroundLight}
          backdropFilter="blur(20px)"
          borderRadius={borderRadius}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="absolute"
          top={0}
          left={0}
          zIndex={1}
        >
          <Box
            fontSize="2xl"
            color="gray.400"
            opacity={0.5}
          >
            📷
          </Box>
        </Box>
      )}

      {/* Main Image */}
      {shouldShowImage && (
        <Image
          src={getOptimizedSrc(imageSrc)}
          alt={alt}
          width="100%"
          height={height}
          objectFit={objectFit}
          borderRadius={borderRadius}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoaded ? 1 : 0}
          transition={`opacity ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
          loading={loading}
        />
      )}

      {/* Error State */}
      {hasError && (
        <Box
          width="100%"
          height={height}
          bg={designTokens.colors.glass.backgroundLight}
          borderRadius={borderRadius}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={2}
          p={4}
        >
          <Alert status="error" variant="subtle" borderRadius="md" size="sm">
            <AlertIcon />
            이미지를 불러올 수 없습니다
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default LazyImage;