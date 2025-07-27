import React, { useState } from 'react';
import { Button, IconButton, Box, Text, useToast } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { designTokens } from '../../theme/tokens';

/**
 * InteractiveButton Components
 * 
 * Enhanced buttons with micro-interactions and visual feedback.
 * Includes like buttons, action buttons with animations, and success feedback.
 */

export interface LikeButtonProps {
  /** Initial liked state */
  isLiked?: boolean;
  /** Like count */
  likeCount?: number;
  /** Callback when like state changes */
  onLikeChange?: (isLiked: boolean) => void;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show count next to button */
  showCount?: boolean;
}

export interface ActionButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  /** Loading state */
  isLoading?: boolean;
  /** Success animation trigger */
  showSuccess?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

// Animated Like Button
export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked = false,
  likeCount = 0,
  onLikeChange,
  size = 'md',
  showCount = true,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);
  
  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLikeChange?.(newLikedState);
  };

  const buttonSize = {
    sm: '32px',
    md: '40px',
    lg: '48px',
  }[size];

  const iconSize = {
    sm: '16px',
    md: '20px',
    lg: '24px',
  }[size];

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <IconButton
          aria-label={liked ? "Unlike" : "Like"}
          icon={
            <motion.div
              initial={false}
              animate={{
                scale: liked ? [1, 1.3, 1] : 1,
                rotate: liked ? [0, 15, -10, 0] : 0,
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              <Box
                fontSize={iconSize}
                color={liked ? "red.500" : "gray.400"}
                transition={`color ${designTokens.animation.fast}`}
              >
                {liked ? "❤️" : "🤍"}
              </Box>
            </motion.div>
          }
          size={size}
          variant="ghost"
          borderRadius="full"
          onClick={handleLike}
          w={buttonSize}
          h={buttonSize}
          _hover={{
            bg: liked ? "red.50" : "gray.50",
          }}
        />
      </motion.div>

      {showCount && (
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Text
              fontSize={size === 'sm' ? 'sm' : 'md'}
              fontWeight="medium"
              color="gray.600"
            >
              {count > 0 ? count : ''}
            </Text>
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

// Animated Action Button
export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  isLoading = false,
  showSuccess = false,
  size = 'md',
}) => {
  const toast = useToast();

  const variantStyles = {
    primary: {
      bg: designTokens.colors.brand.gradient,
      color: 'white',
      _hover: { transform: 'translateY(-2px)', boxShadow: designTokens.shadows.lg },
    },
    secondary: {
      bg: 'gray.100',
      color: 'gray.700',
      _hover: { bg: 'gray.200', transform: 'translateY(-1px)' },
    },
    success: {
      bg: 'green.500',
      color: 'white',
      _hover: { bg: 'green.600', transform: 'translateY(-1px)' },
    },
    danger: {
      bg: 'red.500',
      color: 'white',
      _hover: { bg: 'red.600', transform: 'translateY(-1px)' },
    },
  };

  const handleClick = () => {
    if (showSuccess) {
      toast({
        title: "성공!",
        description: "작업이 완료되었습니다.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        {...variantStyles[variant]}
        size={size}
        onClick={handleClick}
        isLoading={isLoading}
        loadingText="처리중..."
        borderRadius="full"
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.easeInOut}`}
        position="relative"
        overflow="hidden"
        _before={showSuccess ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shimmer 0.8s ease-out',
        } : undefined}
        sx={{
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' },
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={showSuccess ? 'success' : 'normal'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            {showSuccess ? '✨ 완료!' : children}
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default {
  LikeButton,
  ActionButton,
};

/**
 * Usage Examples:
 * 
 * // Like button with count
 * <LikeButton
 *   isLiked={memory.isLiked}
 *   likeCount={memory.likeCount}
 *   onLikeChange={(liked) => handleLike(memory.id, liked)}
 *   size="md"
 *   showCount={true}
 * />
 * 
 * // Action button with success animation
 * <ActionButton
 *   variant="primary"
 *   size="lg"
 *   showSuccess={submitSuccess}
 *   onClick={handleSubmit}
 *   isLoading={isSubmitting}
 * >
 *   추억 저장하기
 * </ActionButton>
 * 
 * // Simple interactive button
 * <ActionButton variant="secondary" onClick={handleEdit}>
 *   수정하기
 * </ActionButton>
 */