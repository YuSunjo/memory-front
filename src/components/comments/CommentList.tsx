import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Spinner,
  Center,
  Divider,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import type { Comment } from '../../types';
import useCommentService from '../../hooks/useCommentService';
import useMemberStore from '../../store/memberStore';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  memoryId: number;
  initialCollapsed?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ 
  memoryId, 
  initialCollapsed = false 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { getComments, createComment, loading } = useCommentService();
  const { member: currentUser } = useMemberStore();

  const loadComments = async (page: number = 0, append: boolean = false) => {
    try {
      if (page > 0) setIsLoadingMore(true);
      
      const response = await getComments({
        memoryId,
        page,
        size: 10,
      });

      if (response) {
        if (append) {
          setComments(prev => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }
        setTotalCount(response.totalCount);
        setCurrentPage(response.currentPage);
        setHasNext(response.hasNext);
      }
    } finally {
      if (page > 0) setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      loadComments(0);
    }
  }, [memoryId, isCollapsed]);

  const handleCommentSubmit = async (content: string) => {
    const newComment = await createComment({
      memoryId,
      content,
    });

    if (newComment) {
      // 새 댓글을 목록 맨 앞에 추가
      setComments(prev => [newComment, ...prev]);
      setTotalCount(prev => prev + 1);
    }
  };

  const handleReplySubmit = async (parentCommentId: number, content: string) => {
    const newReply = await createComment({
      memoryId,
      content,
      parentCommentId,
    });

    if (newReply) {
      // 해당 댓글의 children에 대댓글 추가
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            children: [...(comment.children || []), newReply],
            childrenCount: comment.childrenCount + 1,
          };
        }
        return comment;
      }));
      setTotalCount(prev => prev + 1);
    }
  };

  const loadMoreComments = () => {
    if (hasNext && !isLoadingMore) {
      loadComments(currentPage + 1, true);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 로그인하지 않은 경우에도 댓글을 볼 수 있도록 수정
  // 단, 댓글 작성은 로그인 사용자만 가능
  const canWriteComments = !!currentUser; // 로그인 사용자만 댓글 작성 가능

  return (
    <Box w="full" mt={6}>
      {/* 댓글 섹션 헤더 */}
      <Flex align="center" justify="space-between" mb={4}>
        <Button
          leftIcon={<Icon as={ChatIcon} />}
          variant="ghost"
          onClick={toggleCollapse}
          fontSize="md"
          fontWeight="semibold"
          p={0}
          h="auto"
          _hover={{ bg: 'transparent', color: 'blue.500' }}
        >
          댓글 {totalCount}개
        </Button>
      </Flex>

      {!isCollapsed && (
        <VStack spacing={4} align="stretch">
          {/* 댓글 작성 폼 - 로그인 사용자만 표시 */}
          {canWriteComments && (
            <CommentForm
              onSubmit={handleCommentSubmit}
              isSubmitting={loading}
            />
          )}

          {/* 로그인하지 않은 사용자를 위한 메시지 */}
          {!canWriteComments && (
            <Box 
              p={3} 
              bg="gray.50" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="gray.200"
            >
              <Text fontSize="sm" color="gray.600" textAlign="center">
                댓글을 작성하려면 로그인해주세요.
              </Text>
            </Box>
          )}

          <Divider />

          {/* 댓글 목록 */}
          {loading && comments.length === 0 ? (
            <Center py={8}>
              <Spinner size="md" />
            </Center>
          ) : comments.length === 0 ? (
            <Center py={8}>
              <Text color="gray.500" fontSize="sm">
                첫 댓글을 남겨보세요!
              </Text>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReplySubmit={handleReplySubmit}
                  isSubmitting={loading}
                />
              ))}

              {/* 더 많은 댓글 로드 버튼 */}
              {hasNext && (
                <Center>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMoreComments}
                    isLoading={isLoadingMore}
                    loadingText="로딩 중..."
                  >
                    댓글 더 보기
                  </Button>
                </Center>
              )}
            </VStack>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default CommentList;
