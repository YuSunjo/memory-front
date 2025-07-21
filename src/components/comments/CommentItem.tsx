import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  Button,
  Divider,
} from '@chakra-ui/react';
import type { Comment } from '../../types';
import CommentForm from './CommentForm';
import useMemberStore from '../../store/memberStore';

interface CommentItemProps {
  comment: Comment;
  onReplySubmit: (parentCommentId: number, content: string) => Promise<void>;
  isSubmitting?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReplySubmit,
  isSubmitting = false,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const { member: currentUser } = useMemberStore();
  
  // 로그인 사용자만 댓글 작성 가능
  const canWriteComments = !!currentUser;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes < 1 ? '방금 전' : `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const handleReplySubmit = async (content: string) => {
    try {
      setReplySubmitting(true);
      await onReplySubmit(comment.id, content);
      setShowReplyForm(false);
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <Box w="full">
      {/* 댓글 내용 */}
      <HStack align="flex-start" spacing={3} mb={2}>
        <Avatar
          size="sm"
          name={comment.member.nickname || comment.member.name}
          src={comment.member.profile?.fileUrl}
        />
        <VStack align="flex-start" spacing={1} flex={1}>
          <HStack spacing={2}>
            <Text fontWeight="semibold" fontSize="sm">
              {comment.member.nickname || comment.member.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(comment.createDate)}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.700">
            {comment.content}
          </Text>
          
          {/* 대댓글 버튼 - depth가 0이고 로그인한 경우만 표시 */}
          {comment.depth === 0 && canWriteComments && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="blue"
              onClick={() => setShowReplyForm(!showReplyForm)}
              isDisabled={isSubmitting || replySubmitting}
            >
              답글
            </Button>
          )}
        </VStack>
      </HStack>

      {/* 대댓글 작성 폼 */}
      {showReplyForm && (
        <Box ml={10} mt={2} mb={3}>
          <CommentForm
            onSubmit={handleReplySubmit}
            isSubmitting={replySubmitting}
            placeholder="답글을 입력하세요..."
            submitButtonText="답글 등록"
          />
        </Box>
      )}

      {/* 대댓글들 */}
      {comment.children && comment.children.length > 0 && (
        <Box ml={10} mt={3}>
          <VStack spacing={3} align="stretch">
            {comment.children.map((reply) => (
              <Box key={reply.id}>
                <HStack align="flex-start" spacing={3}>
                  <Avatar
                    size="sm"
                    name={reply.member.nickname || reply.member.name}
                    src={reply.member.profile?.fileUrl}
                  />
                  <VStack align="flex-start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {reply.member.nickname || reply.member.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(reply.createDate)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      {reply.content}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      <Divider mt={4} />
    </Box>
  );
};

export default CommentItem;
