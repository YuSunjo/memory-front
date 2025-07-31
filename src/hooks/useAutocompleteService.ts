import { useState, useCallback } from 'react';
import useApi from './useApi';
import useAuth from './useAuth';
import type {AutocompleteData, AutocompleteSuggestion} from '../types/search';

interface UseAutocompleteServiceReturn {
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
  searchAutocomplete: (query: string) => void;
  clearSuggestions: () => void;
}

export const useAutocompleteService = (): UseAutocompleteServiceReturn => {
  const api = useApi();
  const { isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAutocompleteEndpoint = useCallback((isAuth: boolean) => {
    return isAuth 
      ? '/v1/memories/autocomplete'
      : '/v1/memories/public/autocomplete';
  }, []);

  const searchAutocomplete = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = getAutocompleteEndpoint(isAuthenticated);
      const response = await api.get<AutocompleteData>(endpoint, {
        params: {
          query: query.trim(),
          limit: 10
        }
      });

      if (response.data.statusCode === 200) {
        setSuggestions(response.data.data.suggestions);
      } else {
        setError('자동완성 검색에 실패했습니다.');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      setError('자동완성 검색 중 오류가 발생했습니다.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [api, isAuthenticated, getAutocompleteEndpoint]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchAutocomplete,
    clearSuggestions
  };
};