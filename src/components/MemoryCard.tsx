import React, { useState } from 'react';
import { Box, Image, Text, Flex, IconButton, Link, HStack, Avatar } from '@chakra-ui/react';

interface Author {
  id: number;
  name: string;
  profileImage: string;
}

interface MemoryCardProps {
  images: string[];
  description: string;
  author: Author;
  likes: number;
  comments: number;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ images, description, author }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  // const [isLiked, setIsLiked] = useState(false);
  // const [likeCount, setLikeCount] = useState(likes);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const toggleTextExpand = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  // const handleLikeToggle = () => {
  //   if (isLiked) {
  //     setLikeCount(prev => prev - 1);
  //   } else {
  //     setLikeCount(prev => prev + 1);
  //   }
  //   setIsLiked(!isLiked);
  // };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" bg="white" mb={6}>
      {/* Author header */}
      <HStack p={3} spacing={3} align="center">
        <Avatar 
          size="sm" 
          name={author.name} 
          src={author.profileImage} 
        />
        <Text fontWeight="bold">{author.name}</Text>
      </HStack>

      {/* Image carousel */}
      <Box position="relative">
        <Image 
          src={images[currentImageIndex]} 
          alt={`Memory image ${currentImageIndex + 1}`} 
          width="100%" 
          height="auto"
          objectFit="cover"
          aspectRatio={1}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="Previous image"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
              position="absolute"
              left="2"
              top="50%"
              transform="translateY(-50%)"
              borderRadius="full"
              bg="white"
              opacity="0.7"
              _hover={{ opacity: 1 }}
              onClick={handlePrevImage}
            />
            <IconButton
              aria-label="Next image"
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              borderRadius="full"
              bg="white"
              opacity="0.7"
              _hover={{ opacity: 1 }}
              onClick={handleNextImage}
            />
          </>
        )}

        {/* Image indicator dots */}
        {images.length > 1 && (
          <Flex position="absolute" bottom="2" width="100%" justify="center" gap={1}>
            {images.map((_, index) => (
              <Box
                key={index}
                width="8px"
                height="8px"
                borderRadius="full"
                bg={index === currentImageIndex ? "white" : "whiteAlpha.600"}
              />
            ))}
          </Flex>
        )}
      </Box>

      {/* Description text with "더 보기" functionality */}
      <Box p={4}>
        <Text
          noOfLines={isTextExpanded ? undefined : 2}
          mb={isTextExpanded ? 2 : 0}
        >
          {description}
        </Text>
        {description.length > 100 && (
          <Link
            color="gray.500"
            fontSize="sm"
            onClick={toggleTextExpand}
            _hover={{ textDecoration: 'none' }}
            cursor="pointer"
          >
            {isTextExpanded ? '접기' : '더 보기'}
          </Link>
        )}
      </Box>

    </Box>
  );
};

export default MemoryCard;
