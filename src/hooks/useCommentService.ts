import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import useApi from './useApi';
import useMemberStore from '../store/memberStore';
import type { 
  Comment, 
  CreateCommentRequest, 
  CommentsResponse,
  GetCommentsParams 
} from '../types';

const useCommentService = () => {
  const { get, post } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { member: currentUser } = useMemberStore();

  // 댓글 목록 조회 (로그인 상태에 따라 다른 API 사용)
  const getComments = async (params: GetCommentsParams): Promise<CommentsResponse | null> => {
    try {
      setLoading(true);
      const { memoryId, page = 0, size = 10 } = params;
      
      // 로그인 상태에 따라 API 엔드포인트 결정
      const endpoint = currentUser 
        ? `/v1/comments/memory/${memoryId}/top-level?page=${page}&size=${size}`
        : `/v1/comments/memory/public/${memoryId}/top-level?page=${page}&size=${size}`;
      
      const response = await get<CommentsResponse>(endpoint);
      
      if (response.data.statusCode === 200) {
        return response.data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('댓글 조회 실패:', error);
      toast({
        title: '댓글 조회 실패',
        description: error?.response?.data?.message || '댓글을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 댓글 생성
  const createComment = async (commentData: CreateCommentRequest): Promise<Comment | null> => {
    try {
      setLoading(true);
      
      const response = await post<Comment, CreateCommentRequest>('/v1/comments', commentData);
      
      if (response.data.statusCode === 200) {
        toast({
          title: '댓글 등록',
          description: '댓글이 성공적으로 등록되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        return response.data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('댓글 생성 실패:', error);
      toast({
        title: '댓글 등록 실패',
        description: error?.response?.data?.message || '댓글 등록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 댓글 수만 조회 (가벼운 API) - 로그인 상태에 따라 다른 API 사용
  const getCommentsCount = async (memoryId: number): Promise<number> => {
    try {
      // 로그인 상태에 따라 API 엔드포인트 결정
      const endpoint = currentUser
        ? `/v1/comments/memory/${memoryId}/top-level?page=0&size=1`
        : `/v1/comments/memory/public/${memoryId}/top-level?page=0&size=1`;
        
      const response = await get<CommentsResponse>(endpoint);
      
      if (response.data.statusCode === 200) {
        return response.data.data.totalCount;
      }
      
      return 0;
    } catch (error: any) {
      console.error('댓글 수 조회 실패:', error);
      return 0;
    }
  };

  return {
    getComments,
    createComment,
    getCommentsCount,
    loading,
  };
};

export default useCommentService;
