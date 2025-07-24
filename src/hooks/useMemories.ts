import { useState, useEffect, useRef, useCallback } from 'react';
import useApi from './useApi';
import type { MemoryResponse } from '../types';

type MemoryType = 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';

interface UseMemoriesProps {
  memoryType: MemoryType;
  pageSize?: number;
  skipFetch?: boolean;
}

const useMemories = ({ memoryType, pageSize = 5, skipFetch = false }: UseMemoriesProps) => {
  const api = useApi();
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const memoriesRef = useRef<MemoryResponse[]>([]);

  const fetchMemories = useCallback(async (lastMemoryId?: number) => {
    if (loading || !hasMore || skipFetch) return;

    setLoading(true);
    try {
      let url = `/v1/memories/member?memoryType=${memoryType}&size=${pageSize}`;
      if (lastMemoryId) {
        url += `&lastMemoryId=${lastMemoryId}`;
      }

      const response = await api.get<MemoryResponse[]>(url);
      const newMemories = response.data.data;

      setMemories(prev => {
        const updatedMemories = [...prev, ...newMemories];
        memoriesRef.current = updatedMemories;
        return updatedMemories;
      });

      if (newMemories.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Failed to fetch ${memoryType} memories:`, error);
    } finally {
      setLoading(false);
    }
  }, [api, memoryType, pageSize, skipFetch]);

  // Initial load
  useEffect(() => {
    if (!skipFetch) {
      fetchMemories();
    }
  }, [fetchMemories, skipFetch]);

  return {
    memories,
    loading,
    hasMore,
    memoriesRef,
    fetchMemories
  };
};

export default useMemories;
