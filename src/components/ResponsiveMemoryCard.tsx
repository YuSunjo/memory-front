import React, { useState } from 'react';
import { 
  Box, 
  Image, 
  Text, 
  Flex, 
  IconButton, 
  Link, 
  HStack, 
  Avatar,
  useBreakpointValue,
  AspectRatio
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ViewIcon, ChatIcon } from '@chakra-ui/icons';
import { Card, GradientButton, Body, Caption, ColorSystem } from './design-system';
import { designTokens } from '../theme/tokens';

interface Author {
  id: number;
  name: string;
  profileImage: string;
}

interface ResponsiveMemoryCardProps {
  memoryId: number;
  images: string[];
  description: string;
  author: Author;
  comments: number;
  memorableDate?: string;
  source?: string; // sharing memories에서 온 경우 'sharing'
  hashTags?: string[];
}

const ResponsiveMemoryCard: React.FC<ResponsiveMemoryCardProps> = ({ 
  memoryId, 
  images, 
  description, 
  author, 
  comments,
  memorableDate,
  source,
  hashTags
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  // Responsive configurations
  const cardPadding = useBreakpointValue({ 
    base: designTokens.spacing.sm, 
    md: designTokens.spacing.md, 
    lg: designTokens.spacing.lg 
  });
  
  const cardMargin = useBreakpointValue({ 
    base: designTokens.spacing.md, 
    md: designTokens.spacing.lg, 
    lg: designTokens.spacing.xl 
  });

  // Removed unused imageHeight - using AspectRatio instead

  const avatarSize = useBreakpointValue({ 
    base: 'sm', 
    md: 'md' 
  });

  const handleViewDetail = () => {
    // source가 있으면 query parameter로 전달
    const url = source ? `/memory/${memoryId}?source=${source}` : `/memory/${memoryId}`;
    navigate(url);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const toggleTextExpand = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  return (
    <Card 
      mb={cardMargin}
      width="100%"
      maxWidth={{ base: '100%', md: '500px', lg: '600px' }}
      mx="auto"
      overflow="hidden"
      bg="white"
      borderRadius="2xl"
    >
      {/* Author header */}
      <Flex p={cardPadding} align="center" justify="space-between">
        <HStack spacing={3} align="center">
          <Avatar 
            size={avatarSize}
            name={author.name} 
            src={author.profileImage}
            bg="brand.500"
            color="white"
          />
          <Box>
            <Body 
              weight="bold" 
              fontSize={{ base: 'sm', md: 'base' }}
              color="gray.700"
            >
              {author.name}
            </Body>
            {memorableDate && (
              <Caption 
                color="gray.500"
                mt={1}
              >
                {new Date(memorableDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Caption>
            )}
          </Box>
        </HStack>
        
        {/* 상세보기 버튼 */}
        <IconButton
          aria-label="추억 자세히 보기"
          icon={<ViewIcon />}
          size={useBreakpointValue({ base: 'sm', md: 'md' })}
          variant="solid"
          bg={designTokens.colors.brand.gradient}
          color="white"
          borderRadius="full"
          onClick={handleViewDetail}
          _hover={{ 
            bg: designTokens.colors.brand.gradientHover,
            transform: 'scale(1.1)',
            boxShadow: designTokens.shadows.glow
          }}
          transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        />
      </Flex>

      {/* Image carousel */}
      <Box position="relative">
        {images.length > 0 ? (
          <AspectRatio ratio={1}>
            <Image 
              src={images[currentImageIndex]} 
              alt={`추억 사진 ${currentImageIndex + 1}`} 
              objectFit="cover"
              borderRadius="0"
              transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
            />
          </AspectRatio>
        ) : (
          <AspectRatio ratio={1}>
            <Flex 
              bg="gray.100"
              align="center"
              justify="center"
              direction="column"
              color="gray.500"
            >
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="medium">📷</Text>
              <Text fontSize="sm" mt={1}>사진이 없습니다</Text>
            </Flex>
          </AspectRatio>
        )}

        {/* Navigation arrows - only show when there are multiple images */}
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="이전 사진"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
              position="absolute"
              left={{ base: 2, md: 3 }}
              top="50%"
              transform="translateY(-50%)"
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              bg={designTokens.colors.glass.background}
              backdropFilter="blur(10px)"
              boxShadow={designTokens.shadows.glass}
              opacity="0.8"
              _hover={{ 
                opacity: 1, 
                transform: "translateY(-50%) scale(1.1)",
                bg: designTokens.colors.glass.backgroundDark
              }}
              transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
              onClick={handlePrevImage}
            />
            <IconButton
              aria-label="다음 사진"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
              position="absolute"
              right={{ base: 2, md: 3 }}
              top="50%"
              transform="translateY(-50%)"
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              bg={designTokens.colors.glass.background}
              backdropFilter="blur(10px)"
              boxShadow={designTokens.shadows.glass}
              opacity="0.8"
              _hover={{ 
                opacity: 1, 
                transform: "translateY(-50%) scale(1.1)",
                bg: designTokens.colors.glass.backgroundDark
              }}
              transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
              onClick={handleNextImage}
            />
          </>
        )}

        {/* Image indicator dots - only show when there are multiple images */}
        {images.length > 1 && (
          <Flex 
            position="absolute" 
            bottom={2} 
            width="100%" 
            justify="center" 
            gap={1}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                width={{ base: '6px', md: '8px' }}
                height={{ base: '6px', md: '8px' }}
                borderRadius="full"
                bg={index === currentImageIndex ? "white" : "whiteAlpha.600"}
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                cursor="pointer"
                onClick={() => setCurrentImageIndex(index)}
                transition={`all ${designTokens.animation.fast} ${designTokens.animation.easing.ease}`}
                _hover={{ transform: 'scale(1.2)' }}
              />
            ))}
          </Flex>
        )}
      </Box>

      {/* Description text with "더 보기" functionality */}
      <Box p={cardPadding}>
        <Body
          fontSize={{ base: 'sm', md: 'base' }}
          color="gray.700"
          noOfLines={isTextExpanded ? undefined : 2}
          mb={isTextExpanded ? 2 : 0}
        >
          {description}
        </Body>
        {description.length > 100 && (
          <Link
            color="brand.500"
            fontSize="sm"
            fontWeight="medium"
            onClick={toggleTextExpand}
            _hover={{ 
              textDecoration: 'none',
              color: 'brand.600'
            }}
            cursor="pointer"
            transition={`all ${designTokens.animation.fast} ${designTokens.animation.easing.ease}`}
          >
            {isTextExpanded ? '접기' : '더 보기'}
          </Link>
        )}

        {/* Hash tags */}
        {hashTags && hashTags.length > 0 && (
          <Flex wrap="wrap" gap={2} mt={3}>
            {hashTags.map((tag, index) => (
              <ColorSystem
                key={index}
                variant="brand"
                intensity="subtle"
                as="span"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="medium"
                border
                _hover={{
                  bg: "brand.100",
                  transform: "scale(1.05)"
                }}
                transition={`all ${designTokens.animation.fast} ${designTokens.animation.easing.ease}`}
                cursor="pointer"
              >
                #{tag}
              </ColorSystem>
            ))}
          </Flex>
        )}
      </Box>

      {/* Actions bar */}
      <Box px={cardPadding} pb={cardPadding}>
        <HStack spacing={3}>
          <GradientButton
            leftIcon={<ChatIcon />}
            variant="ghost"
            size="sm"
            onClick={handleViewDetail}
            borderRadius="full"
          >
            댓글 {comments}개
          </GradientButton>
        </HStack>
      </Box>
    </Card>
  );
};

export default ResponsiveMemoryCard;