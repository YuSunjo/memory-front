import useApi from './useApi';
import type {MemoryResponse} from '../types';

const useMemoryService = () => {
  const api = useApi();

  // 특정 메모리 조회
  const getMemoryById = async (memoryId: number): Promise<MemoryResponse> => {
    try {
      const response = await api.get<MemoryResponse>(`/v1/memories/${memoryId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching memory by ID:', error);
      throw error;
    }
  };

  // 공개 메모리 조회 (로그인 불필요)
  const getPublicMemoryById = async (memoryId: number): Promise<MemoryResponse> => {
    try {
      const response = await api.get<MemoryResponse>(`/v1/memories/public/${memoryId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching public memory by ID:', error);
      throw error;
    }
  };

  // 메모리 삭제
  const deleteMemory = async (memoryId: number): Promise<void> => {
    try {
      await api.delete(`/v1/memories/${memoryId}`);
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  };

  // 메모리 수정
  const updateMemory = async (memoryId: number, content: string, memoryType: string): Promise<MemoryResponse> => {
    try {
      const response = await api.put<MemoryResponse>(`/v1/memories/${memoryId}`, {
        content,
        memoryType
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  };

  return {
    getMemoryById,
    getPublicMemoryById,
    deleteMemory,
    updateMemory
  };
};

export default useMemoryService;