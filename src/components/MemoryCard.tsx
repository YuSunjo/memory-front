import React, { useState } from 'react';
import { Box, Image, Text, Flex, IconButton, Link, HStack, Avatar, Icon, Button } from '@chakra-ui/react';

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

const MemoryCard: React.FC<MemoryCardProps> = ({ images, description, author, likes, comments }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const toggleTextExpand = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const handleLikeToggle = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

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

      {/* Like and comment section */}
      <Box px={4} pb={3}>
        <HStack spacing={4} mb={2}>
          <Button 
            variant="ghost" 
            p={0} 
            height="auto" 
            onClick={handleLikeToggle}
            color={isLiked ? "red.500" : "gray.700"}
            _hover={{ background: "transparent" }}
          >
            <Icon boxSize={6} viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </Icon>
          </Button>
          <Button 
            variant="ghost" 
            p={0} 
            height="auto"
            _hover={{ background: "transparent" }}
          >
            <Icon boxSize={6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </Icon>
          </Button>
        </HStack>

        <Text fontWeight="bold" mb={1}>{likeCount}명이 좋아합니다</Text>
        <Text fontSize="sm" color="gray.500">댓글 {comments}개</Text>
      </Box>
    </Box>
  );
};

export default MemoryCard;
