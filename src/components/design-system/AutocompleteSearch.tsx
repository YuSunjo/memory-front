import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Spinner,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { useAutocompleteService } from '../../hooks/useAutocompleteService';
import type { AutocompleteSuggestion, GroupedAutocompleteSuggestion } from '../../types/search';

export interface AutocompleteSearchProps {
  placeholder?: string;
  onSuggestionSelect?: (suggestion: AutocompleteSuggestion) => void;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

// 동일한 텍스트의 제안을 그룹화하는 유틸리티 함수
const groupSuggestions = (suggestions: AutocompleteSuggestion[]): GroupedAutocompleteSuggestion[] => {
  const groupMap = new Map<string, GroupedAutocompleteSuggestion>();

  suggestions.forEach(suggestion => {
    const existing = groupMap.get(suggestion.text);
    
    if (existing) {
      // 이미 존재하는 텍스트면 타입과 카운트를 추가
      if (!existing.types.includes(suggestion.type)) {
        existing.types.push(suggestion.type);
      }
      existing.totalMatchCount += suggestion.matchCount;
      existing.maxScore = Math.max(existing.maxScore, suggestion.score);
    } else {
      // 새로운 텍스트면 새 그룹 생성
      groupMap.set(suggestion.text, {
        text: suggestion.text,
        types: [suggestion.type],
        totalMatchCount: suggestion.matchCount,
        maxScore: suggestion.score
      });
    }
  });

  // 점수 높은 순으로 정렬
  return Array.from(groupMap.values())
    .sort((a, b) => b.maxScore - a.maxScore);
};

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  placeholder = '검색어를 입력하세요...',
  onSuggestionSelect,
  onSearch,
  value = '',
  onChange
}) => {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading, searchAutocomplete, clearSuggestions } = useAutocompleteService();
  
  // 그룹화된 제안 목록 생성
  const groupedSuggestions = groupSuggestions(suggestions);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAutocomplete(searchQuery);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 1000);
  }, [searchAutocomplete, clearSuggestions]);

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
    debouncedSearch(newValue);
  };

  // 제안 선택 처리
  const handleSuggestionClick = (groupedSuggestion: GroupedAutocompleteSuggestion) => {
    setQuery(groupedSuggestion.text);
    onChange?.(groupedSuggestion.text);
    setShowSuggestions(false);
    
    // 원본 제안 중에서 첫 번째 것을 사용하여 콜백 호출
    const originalSuggestion = suggestions.find(s => s.text === groupedSuggestion.text);
    if (originalSuggestion) {
      onSuggestionSelect?.(originalSuggestion);
    }
    
    inputRef.current?.focus();
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || groupedSuggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        onSearch?.(query);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < groupedSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : groupedSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < groupedSuggestions.length) {
          handleSuggestionClick(groupedSuggestions[selectedIndex]);
        } else if (query.trim()) {
          onSearch?.(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 입력 필드 클리어
  const handleClear = () => {
    setQuery('');
    onChange?.('');
    clearSuggestions();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // value prop 변경 시 동기화
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  return (
    <Box position="relative" w="100%">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          bg={bgColor}
          borderColor={borderColor}
          _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px blue.400'
          }}
        />
        {(query || loading) && (
          <InputRightElement>
            {loading ? (
              <Spinner size="sm" color="blue.400" />
            ) : (
              <IconButton
                aria-label="검색어 지우기"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={handleClear}
              />
            )}
          </InputRightElement>
        )}
      </InputGroup>

      {showSuggestions && groupedSuggestions.length > 0 && (
        <Box
          ref={suggestionBoxRef}
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          zIndex="dropdown"
          maxH="300px"
          overflowY="auto"
          mt="1"
        >
          <VStack spacing={0} align="stretch">
            {groupedSuggestions.map((groupedSuggestion, index) => (
              <HStack
                key={`${groupedSuggestion.text}-${index}`}
                p={3}
                spacing={3}
                cursor="pointer"
                bg={index === selectedIndex ? selectedBgColor : 'transparent'}
                _hover={{ bg: hoverBgColor }}
                onClick={() => handleSuggestionClick(groupedSuggestion)}
                align="center"
              >
                <SearchIcon boxSize={4} color="gray.400" />
                <Text flex={1} fontSize="sm">
                  {groupedSuggestion.text}
                </Text>
                <HStack spacing={1}>
                  {groupedSuggestion.types.map((type) => (
                    <Badge
                      key={type}
                      size="sm"
                      colorScheme={type === 'TITLE' ? 'blue' : 'green'}
                    >
                      {type === 'TITLE' ? '제목' : '태그'}
                    </Badge>
                  ))}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {groupedSuggestion.totalMatchCount}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};