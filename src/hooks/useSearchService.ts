import { useState, useCallback } from 'react';
import useApi from './useApi';
import useAuth from './useAuth';
import type { SearchRequest, SearchResponse, SearchData } from '../types/search';

interface UseSearchServiceReturn {
  searchResults: SearchData | null;
  loading: boolean;
  error: string | null;
  searchMemories: (searchParams: Omit<SearchRequest, 'type' | 'highlight'>) => Promise<void>;
  clearResults: () => void;
}

export const useSearchService = (): UseSearchServiceReturn => {
  const api = useApi();
  const { isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSearchEndpoint = useCallback((isAuth: boolean) => {
    return isAuth 
      ? '/v1/memories/search'
      : '/v1/memories/public/search';
  }, []);

  const searchMemories = useCallback(async (searchParams: Omit<SearchRequest, 'type' | 'highlight'>) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = getSearchEndpoint(isAuthenticated);
      const requestBody: SearchRequest = {
        type: 'ALL',
        highlight: true,
        ...searchParams
      };

      const response = await api.post<SearchResponse>(endpoint, requestBody);

      if (response.data.statusCode === 200) {
        setSearchResults(response.data.data);
      } else {
        setError('검색에 실패했습니다.');
        setSearchResults(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('검색 중 오류가 발생했습니다.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [api, isAuthenticated, getSearchEndpoint]);

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchMemories,
    clearResults
  };
};