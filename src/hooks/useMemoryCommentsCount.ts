import { useState, useEffect } from 'react';
import useCommentService from './useCommentService';

interface UseMemoryCommentsCountProps {
  memoryId: number;
  enabled?: boolean; // 조회 활성화 여부
}

const useMemoryCommentsCount = ({ memoryId, enabled = true }: UseMemoryCommentsCountProps) => {
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { getCommentsCount } = useCommentService();

  useEffect(() => {
    if (!enabled || !memoryId) return;

    const fetchCommentsCount = async () => {
      setLoading(true);
      try {
        const count = await getCommentsCount(memoryId);
        setCommentsCount(count);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentsCount();
  }, [memoryId, enabled, getCommentsCount]);

  return {
    commentsCount,
    loading,
    refetch: () => {
      if (enabled && memoryId) {
        const fetchCommentsCount = async () => {
          setLoading(true);
          try {
            const count = await getCommentsCount(memoryId);
            setCommentsCount(count);
          } finally {
            setLoading(false);
          }
        };
        fetchCommentsCount();
      }
    }
  };
};

export default useMemoryCommentsCount;
