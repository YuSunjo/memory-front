import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  Avatar,
  Tag,
  Flex,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import type { SearchData, SearchMemory } from '../types/search';

interface MemorySearchCardProps {
  memory: SearchMemory;
}

const MemorySearchCard: React.FC<MemorySearchCardProps> = ({ memory }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCardClick = () => {
    navigate(`/memory/${memory.memoryId}`);
  };

  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'green';
      case 'PRIVATE':
        return 'blue';
      case 'RELATIONSHIP':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string | null, textDate: string) => {
    if (dateString) {
      return new Date(dateString).toLocaleDateString('ko-KR');
    }
    return textDate || '날짜 없음';
  };

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="lg"
      cursor="pointer"
      onClick={handleCardClick}
      transition="all 0.2s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
    >
      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          {/* Header with type and date */}
          <HStack justify="space-between" align="center">
            <Badge colorScheme={getMemoryTypeColor(memory.memoryType)} variant="subtle">
              {memory.memoryType === 'PUBLIC' ? '공개' : 
               memory.memoryType === 'PRIVATE' ? '비공개' : '관계'}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {formatDate(memory.memorableDate, memory.memorableDateText)}
            </Text>
          </HStack>

          {/* Title */}
          <Text fontSize="lg" fontWeight="bold" lineHeight="1.3">
            {memory.title}
          </Text>

          {/* Content preview */}
          <Text
            fontSize="sm"
            color="gray.600"
            noOfLines={2}
            lineHeight="1.5"
          >
            {memory.content}
          </Text>

          {/* Location */}
          {memory.locationName && (
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.500">📍</Text>
              <Text fontSize="sm" color="gray.600">
                {memory.locationName}
              </Text>
            </HStack>
          )}

          {/* Hashtags */}
          {memory.hashtags && memory.hashtags.length > 0 && (
            <Flex wrap="wrap" gap={1}>
              {memory.hashtags.map((tag, index) => (
                <Tag key={index} size="sm" colorScheme="blue" variant="subtle">
                  #{tag}
                </Tag>
              ))}
            </Flex>
          )}

          {/* Member info */}
          <HStack spacing={2} pt={2} borderTop="1px solid" borderColor={borderColor}>
            <Avatar size="xs" />
            <Text fontSize="sm" color="gray.600">
              사용자 ID: {memory.memberId}
            </Text>
            {memory.relationshipMemberId && (
              <Text fontSize="sm" color="gray.500">
                • 관계 ID: {memory.relationshipMemberId}
              </Text>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange
}) => {

  return (
    <HStack spacing={2} justify="center" mt={6}>
      <Button
        leftIcon={<ChevronLeftIcon />}
        size="sm"
        variant="outline"
        isDisabled={!hasPrevious}
        onClick={() => onPageChange(currentPage - 1)}
      >
        이전
      </Button>

      <HStack spacing={1}>
        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
          const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + index;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              size="sm"
              variant={isCurrentPage ? 'solid' : 'ghost'}
              colorScheme={isCurrentPage ? 'blue' : 'gray'}
              onClick={() => onPageChange(pageNum)}
              minW="32px"
            >
              {pageNum + 1}
            </Button>
          );
        })}
      </HStack>

      <Button
        rightIcon={<ChevronRightIcon />}
        size="sm"
        variant="outline"
        isDisabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
      </Button>
    </HStack>
  );
};

interface SearchResultsProps {
  searchResults: SearchData | null;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  loading,
  error,
  onPageChange
}) => {
  if (loading) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">검색 중...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!searchResults) {
    return null;
  }

  const { memories, pageInfo, metadata } = searchResults;

  if (memories.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text fontSize="lg" color="gray.500" mb={2}>
          검색 결과가 없습니다
        </Text>
        <Text fontSize="sm" color="gray.400">
          다른 검색어로 시도해보세요
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Search metadata */}
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <Text fontSize="sm" color="gray.600">
          총 <strong>{pageInfo.totalElements}</strong>개의 결과
        </Text>
        <Text fontSize="xs" color="gray.400">
          검색 시간: {metadata.searchTimeMs}ms
        </Text>
      </HStack>

      {/* Results */}
      <VStack spacing={4} align="stretch">
        {memories.map((memory) => (
          <MemorySearchCard key={memory.memoryId} memory={memory} />
        ))}
      </VStack>

      {/* Pagination */}
      {pageInfo.totalPages > 1 && (
        <Pagination
          currentPage={pageInfo.currentPage}
          totalPages={pageInfo.totalPages}
          hasNext={pageInfo.hasNext}
          hasPrevious={pageInfo.hasPrevious}
          onPageChange={onPageChange}
        />
      )}
    </VStack>
  );
};