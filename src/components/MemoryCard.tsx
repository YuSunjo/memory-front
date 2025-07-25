import React, { useState } from 'react';
import { Box, Image, Text, Flex, IconButton, Link, HStack, Avatar, Button, Tag } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ViewIcon, ChatIcon } from '@chakra-ui/icons';

interface Author {
  id: number;
  name: string;
  profileImage: string;
}

interface MemoryCardProps {
  memoryId: number;
  images: string[];
  description: string;
  author: Author;
  comments: number;
  memorableDate?: string;
  source?: string; // sharing memories에서 온 경우 'sharing'
  hashTags?: string[];
}

const MemoryCard: React.FC<MemoryCardProps> = ({ 
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
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" bg="white" mb={6}>
      {/* Author header */}
      <Flex p={3} align="center" justify="space-between">
        <HStack spacing={3} align="center">
          <Avatar 
            size="sm" 
            name={author.name} 
            src={author.profileImage} 
          />
          <Box>
            <Text fontWeight="bold">{author.name}</Text>
            {memorableDate && (
              <Text fontSize="sm" color="gray.500">
                {new Date(memorableDate).toLocaleDateString()}
              </Text>
            )}
          </Box>
        </HStack>
        
        {/* 상세보기 버튼 */}
        <IconButton
          aria-label="View details"
          icon={<ViewIcon />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={handleViewDetail}
          _hover={{ bg: 'blue.50' }}
        />
      </Flex>

      {/* Image carousel */}
      <Box position="relative">
        {images.length > 0 ? (
          <Image 
            src={images[currentImageIndex]} 
            alt={`Memory image ${currentImageIndex + 1}`} 
            width="100%" 
            height="auto"
            objectFit="cover"
            aspectRatio={1}
          />
        ) : (
          <Flex 
            width="100%" 
            height="300px"
            bg="gray.100"
            align="center"
            justify="center"
            direction="column"
            color="gray.500"
          >
            <Text fontSize="lg" fontWeight="medium">📷</Text>
            <Text fontSize="sm" mt={1}>사진이 없습니다</Text>
          </Flex>
        )}

        {/* Navigation arrows - only show when there are multiple images */}
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

        {/* Image indicator dots - only show when there are multiple images */}
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

        {/* Hash tags */}
        {hashTags && hashTags.length > 0 && (
          <Flex wrap="wrap" gap={1} mt={2}>
            {hashTags.map((tag, index) => (
              <Tag key={index} size="sm" colorScheme="blue" variant="subtle">
                #{tag}
              </Tag>
            ))}
          </Flex>
        )}
      </Box>

      {/* Actions bar */}
      <Box px={4} pb={4}>
        <HStack spacing={3}>
          <Button
            leftIcon={<ChatIcon />}
            variant="ghost"
            size="sm"
            colorScheme="gray"
            onClick={handleViewDetail}
            _hover={{ bg: 'gray.50' }}
          >
            댓글 {comments}개
          </Button>
        </HStack>
      </Box>

    </Box>
  );
};

export default MemoryCard;
