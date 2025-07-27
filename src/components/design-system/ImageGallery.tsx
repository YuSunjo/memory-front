import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  IconButton,
  HStack,
  Text,
  VStack,
  useDisclosure,
  Portal
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { LazyImage } from './LazyImage';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import { designTokens } from '../../theme/tokens';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  columns?: { base: number; md: number; lg: number };
  spacing?: number;
  aspectRatio?: number;
  enableLightbox?: boolean;
  enablePreload?: boolean;
  maxPreloadImages?: number;
  quality?: number;
  enableWebP?: boolean;
  onImageClick?: (image: ImageItem, index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = { base: 1, md: 2, lg: 3 },
  spacing = 4,
  aspectRatio = 1,
  enableLightbox = true,
  enablePreload = true,
  maxPreloadImages = 6,
  quality = 80,
  enableWebP = true,
  onImageClick,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const {
    preloadCriticalImages,
    preloadImages,
    isImageCached
  } = useImagePreloader({
    quality,
    enableWebP
  });

  // Preload critical images on mount
  useEffect(() => {
    if (!enablePreload || images.length === 0) return;

    const preloadUrls = images
      .slice(0, maxPreloadImages)
      .map(img => img.thumbnail || img.src);

    preloadCriticalImages(preloadUrls);
  }, [images, enablePreload, maxPreloadImages, preloadCriticalImages]);

  // Handle image click
  const handleImageClick = useCallback((image: ImageItem, index: number) => {
    setSelectedIndex(index);
    
    if (enableLightbox) {
      onOpen();
      
      // Preload adjacent images when lightbox opens
      if (enablePreload) {
        const adjacentImages = [
          images[index - 1]?.src,
          images[index + 1]?.src
        ].filter(Boolean);
        
        preloadImages(adjacentImages);
      }
    }
    
    onImageClick?.(image, index);
  }, [enableLightbox, onOpen, enablePreload, images, preloadImages, onImageClick]);

  // Navigate in lightbox
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + images.length) % images.length
      : (selectedIndex + 1) % images.length;
    
    setSelectedIndex(newIndex);
    
    // Preload next images in sequence
    if (enablePreload) {
      const nextImages = direction === 'next'
        ? [images[newIndex + 1]?.src, images[newIndex + 2]?.src]
        : [images[newIndex - 1]?.src, images[newIndex - 2]?.src];
      
      preloadImages(nextImages.filter(Boolean));
    }
    
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, selectedIndex, images, enablePreload, preloadImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, navigateImage, onClose]);

  if (!images || images.length === 0) {
    return (
      <Box 
        p={8} 
        textAlign="center" 
        color="gray.500"
        bg={designTokens.colors.glass.backgroundLight}
        borderRadius="xl"
      >
        <Text fontSize="lg">📷</Text>
        <Text fontSize="sm" mt={2}>이미지가 없습니다</Text>
      </Box>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <>
      {/* Gallery Grid */}
      <Grid
        templateColumns={{
          base: `repeat(${columns.base}, 1fr)`,
          md: `repeat(${columns.md}, 1fr)`,
          lg: `repeat(${columns.lg}, 1fr)`
        }}
        gap={spacing}
        width="100%"
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            position="relative"
            aspectRatio={aspectRatio}
            cursor={enableLightbox ? 'pointer' : 'default'}
            borderRadius="xl"
            overflow="hidden"
            bg={designTokens.colors.glass.backgroundLight}
            transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
            _hover={enableLightbox ? {
              transform: 'scale(1.02)',
              boxShadow: designTokens.shadows.lg
            } : {}}
            onClick={() => handleImageClick(image, index)}
          >
            <LazyImage
              src={image.thumbnail || image.src}
              alt={image.alt}
              width="100%"
              height="100%"
              objectFit="cover"
              borderRadius="xl"
              quality={quality}
              enableWebP={enableWebP}
              placeholder={isImageCached(image.thumbnail || image.src) ? 'none' : 'skeleton'}
            />
            
            {/* Image overlay with caption */}
            {image.caption && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
                p={3}
                borderBottomRadius="xl"
              >
                <Text
                  color="white"
                  fontSize="sm"
                  fontWeight="medium"
                  noOfLines={2}
                >
                  {image.caption}
                </Text>
              </Box>
            )}
          </Box>
        ))}
      </Grid>

      {/* Lightbox Modal */}
      {enableLightbox && (
        <Portal>
          <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="full"
            motionPreset="slideInBottom"
          >
            <ModalOverlay bg="blackAlpha.900" />
            <ModalContent
              bg="transparent"
              boxShadow="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <ModalCloseButton
                color="white"
                size="lg"
                top={4}
                right={4}
                bg="blackAlpha.600"
                borderRadius="full"
                _hover={{ bg: 'blackAlpha.800' }}
              />

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous image"
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    colorScheme="whiteAlpha"
                    bg="blackAlpha.600"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    onClick={() => navigateImage('prev')}
                    isDisabled={isNavigating}
                    _hover={{ bg: 'blackAlpha.800' }}
                    zIndex={2}
                  />
                  
                  <IconButton
                    aria-label="Next image"
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    colorScheme="whiteAlpha"
                    bg="blackAlpha.600"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    onClick={() => navigateImage('next')}
                    isDisabled={isNavigating}
                    _hover={{ bg: 'blackAlpha.800' }}
                    zIndex={2}
                  />
                </>
              )}

              {/* Main Image Container */}
              <VStack spacing={4} maxW="90vw" maxH="90vh">
                <Box
                  position="relative"
                  maxW="100%"
                  maxH="80vh"
                  borderRadius="xl"
                  overflow="hidden"
                  bg="black"
                >
                  <LazyImage
                    src={selectedImage?.src}
                    alt={selectedImage?.alt}
                    width="auto"
                    height="auto"
                    objectFit="contain"
                    borderRadius="xl"
                    loading="eager"
                    quality={100}
                    enableWebP={enableWebP}
                    placeholder="blur"
                  />
                </Box>

                {/* Image Info */}
                {(selectedImage?.caption || images.length > 1) && (
                  <VStack spacing={2} color="white" textAlign="center">
                    {selectedImage?.caption && (
                      <Text fontSize="lg" fontWeight="medium">
                        {selectedImage.caption}
                      </Text>
                    )}
                    
                    {images.length > 1 && (
                      <HStack spacing={2} fontSize="sm" color="gray.300">
                        <Text>{selectedIndex + 1}</Text>
                        <Text>/</Text>
                        <Text>{images.length}</Text>
                      </HStack>
                    )}
                  </VStack>
                )}
              </VStack>
            </ModalContent>
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default ImageGallery;