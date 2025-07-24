import { useState, useEffect, useRef, useCallback } from 'react';
import useApi from './useApi';
import type { MemoryResponse } from '../types';

interface UsePublicMemoriesProps {
  pageSize?: number;
  skipFetch?: boolean;
}

const usePublicMemories = ({ pageSize = 5, skipFetch = false }: UsePublicMemoriesProps = {}) => {
  const api = useApi();
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const memoriesRef = useRef<MemoryResponse[]>([]);

  const fetchMemories = useCallback(async (lastMemoryId?: number) => {
    if (loading || !hasMore || skipFetch) return;

    setLoading(true);
    try {
      let url = `/v1/memories/public?size=${pageSize}`;
      if (lastMemoryId) {
        url += `&lastMemoryId=${lastMemoryId}`;
      }

      const response = await api.get<MemoryResponse[]>(url);
      const newMemories = response.data.data;

      setMemories(prev => {
        const updatedMemories = lastMemoryId ? [...prev, ...newMemories] : newMemories;
        memoriesRef.current = updatedMemories;
        return updatedMemories;
      });

      // 받은 데이터가 pageSize보다 적으면 더 이상 데이터가 없음
      if (newMemories.length < pageSize) {
        setHasMore(false);
      }

      // 초기 로드 완료 표시
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to fetch public memories:', error);
    } finally {
      setLoading(false);
    }
  }, [api, pageSize, skipFetch, isInitialLoad]);

  // Initial load - 한 번만 실행
  useEffect(() => {
    if (!skipFetch && isInitialLoad) {
      fetchMemories();
    }
  }, [skipFetch, isInitialLoad]);

  return {
    memories,
    loading,
    hasMore,
    memoriesRef,
    fetchMemories,
    isInitialLoad
  };
};

export default usePublicMemories;
