import React, { useState } from 'react';
import {
  Box,
  Textarea,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  submitButtonText?: string;
  maxLength?: number;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isSubmitting = false,
  placeholder = "댓글을 입력하세요...",
  submitButtonText = "댓글 등록",
  maxLength = 500,
}) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content.trim());
      setContent('');
      setIsFocused(false);
    } catch (error) {
      // 에러는 useCommentService에서 처리됨
      console.error('댓글 제출 오류:', error);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box w="full">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        resize="vertical"
        minH="80px"
        maxH="200px"
        maxLength={maxLength}
        isDisabled={isSubmitting}
        borderColor={isFocused ? "blue.300" : "gray.200"}
        _hover={{
          borderColor: isFocused ? "blue.300" : "gray.300",
        }}
        _focus={{
          borderColor: "blue.300",
          boxShadow: "0 0 0 1px var(--chakra-colors-blue-300)",
        }}
      />
      
      <HStack justify="space-between" mt={2}>
        <Text fontSize="xs" color="gray.500">
          {content.length}/{maxLength}자 (Ctrl+Enter: 등록)
        </Text>
        
        {(isFocused || content.trim()) && (
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!content.trim()}
              loadingText="등록 중..."
            >
              {submitButtonText}
            </Button>
          </HStack>
        )}
      </HStack>
    </Box>
  );
};

export default CommentForm;
