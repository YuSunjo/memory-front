import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { AutocompleteSearch } from '../components/design-system';
import { SearchResults } from '../components/SearchResults';
import { useSearchService } from '../hooks/useSearchService';
import type { AutocompleteSuggestion } from '../types/search';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const { searchResults, loading, error, searchMemories, clearResults } = useSearchService();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // 검색 실행
  const handleSearch = useCallback(async (query: string, page: number = 0) => {
    if (!query.trim()) return;

    await searchMemories({
      query: query.trim(),
      page,
      size: 10
    });

    setHasSearched(true);
    setCurrentPage(page);
  }, [searchMemories]);

  // 자동완성에서 제안 선택 시
  const handleSuggestionSelect = useCallback((suggestion: AutocompleteSuggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text, 0);
  }, [handleSearch]);

  // 검색 버튼 클릭 또는 엔터키
  const handleSearchButtonClick = useCallback(() => {
    handleSearch(searchQuery, 0);
  }, [searchQuery, handleSearch]);

  // 페이지 변경
  const handlePageChange = useCallback((page: number) => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, page);
    }
  }, [searchQuery, handleSearch]);

  // 검색어 변경
  const handleQueryChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (!value.trim() && hasSearched) {
      clearResults();
      setHasSearched(false);
    }
  }, [clearResults, hasSearched]);

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              메모리 검색
            </Text>
            <Text fontSize="lg" color="gray.600">
              추억을 검색하고 찾아보세요
            </Text>
          </VStack>

          {/* Search Section */}
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <VStack spacing={4}>
              <HStack w="100%" spacing={3}>
                <Box flex={1}>
                  <AutocompleteSearch
                    placeholder="검색어를 입력하세요... (제목, 내용, 해시태그)"
                    value={searchQuery}
                    onChange={handleQueryChange}
                    onSuggestionSelect={handleSuggestionSelect}
                    onSearch={(query) => handleSearch(query, 0)}
                  />
                </Box>
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="blue"
                  size="md"
                  onClick={handleSearchButtonClick}
                  isDisabled={!searchQuery.trim()}
                  px={6}
                >
                  검색
                </Button>
              </HStack>

              {/* Search tips */}
              {!hasSearched && (
                <Box w="100%" pt={2}>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    💡 검색어를 입력하면 1초 후 자동완성이 표시됩니다
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Results Section */}
          {hasSearched && (
            <>
              <Divider />
              <Box>
                <SearchResults
                  searchResults={searchResults}
                  loading={loading}
                  error={error}
                  onPageChange={handlePageChange}
                />
              </Box>
            </>
          )}

          {/* Empty state when no search performed */}
          {!hasSearched && (
            <Box textAlign="center" py={12}>
              <VStack spacing={4}>
                <Box fontSize="4xl">🔍</Box>
                <Text fontSize="lg" color="gray.600">
                  검색어를 입력하여 메모리를 찾아보세요
                </Text>
                <VStack spacing={2} fontSize="sm" color="gray.500">
                  <Text>• 제목, 내용, 해시태그로 검색할 수 있습니다</Text>
                  <Text>• 자동완성 기능으로 빠르게 검색하세요</Text>
                  <Text>• 검색 결과는 페이지별로 표시됩니다</Text>
                </VStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default SearchPage;