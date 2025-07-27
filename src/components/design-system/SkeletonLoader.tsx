import React from 'react';
import { Box, Skeleton, VStack, HStack, SkeletonText, SkeletonCircle } from '@chakra-ui/react';
import { designTokens } from '../../theme/tokens';

/**
 * SkeletonLoader Components
 * 
 * Collection of skeleton loading components for different content types.
 * Provides smooth loading states while content is being fetched.
 */

export interface SkeletonLoaderProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Animation speed */
  speed?: number;
  /** Custom height for skeleton items */
  height?: string;
}

// Memory Card Skeleton
export const MemoryCardSkeleton: React.FC<SkeletonLoaderProps> = ({ 
  count = 3,
  speed = 1.5 
}) => {
  return (
    <VStack spacing={6} w="100%">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          w="100%"
          p={4}
          bg="white"
          borderRadius="xl"
          boxShadow={designTokens.shadows.md}
          border={`1px solid ${designTokens.colors.glass.border}`}
        >
          <VStack spacing={4} align="stretch">
            {/* Image skeleton */}
            <Skeleton 
              height="200px" 
              borderRadius="lg" 
              speed={speed}
              startColor="gray.100"
              endColor="gray.200"
            />
            
            {/* Content skeleton */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Skeleton height="20px" width="60%" speed={speed} />
                <SkeletonCircle size="8" speed={speed} />
              </HStack>
              
              <SkeletonText 
                mt={2} 
                noOfLines={2} 
                spacing={2}
                skeletonHeight={3}
                speed={speed}
              />
              
              <HStack justify="space-between" mt={4}>
                <Skeleton height="16px" width="30%" speed={speed} />
                <Skeleton height="32px" width="80px" borderRadius="full" speed={speed} />
              </HStack>
            </VStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC<SkeletonLoaderProps> = ({ 
  count = 5,
  speed = 1.5
}) => {
  return (
    <VStack spacing={3} w="100%">
      {Array.from({ length: count }).map((_, index) => (
        <HStack
          key={index}
          w="100%"
          p={3}
          spacing={4}
          bg="white"
          borderRadius="lg"
          border={`1px solid ${designTokens.colors.glass.border}`}
        >
          <SkeletonCircle size="12" speed={speed} />
          <VStack spacing={2} align="stretch" flex={1}>
            <Skeleton height="16px" width="70%" speed={speed} />
            <Skeleton height="12px" width="50%" speed={speed} />
          </VStack>
          <Skeleton height="24px" width="60px" borderRadius="full" speed={speed} />
        </HStack>
      ))}
    </VStack>
  );
};

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => {
  return (
    <HStack 
      spacing={6} 
      justify="center" 
      p={4}
      bg={designTokens.colors.glass.background}
      borderRadius="xl"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <VStack key={index} spacing={1}>
          <SkeletonCircle size="8" speed={1.5} />
          <Skeleton height="8px" width="40px" speed={1.5} />
        </VStack>
      ))}
    </HStack>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <VStack spacing={6} align="center" p={6}>
      <SkeletonCircle size="24" speed={1.5} />
      <VStack spacing={3} align="center">
        <Skeleton height="24px" width="150px" speed={1.5} />
        <Skeleton height="16px" width="200px" speed={1.5} />
        <Skeleton height="12px" width="100px" speed={1.5} />
      </VStack>
      <HStack spacing={4}>
        <Skeleton height="36px" width="80px" borderRadius="full" speed={1.5} />
        <Skeleton height="36px" width="80px" borderRadius="full" speed={1.5} />
      </HStack>
    </VStack>
  );
};

// Generic Content Skeleton
export const ContentSkeleton: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  speed = 1.5,
  height = "20px"
}) => {
  return (
    <VStack spacing={4} w="100%">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          height={height} 
          width={`${Math.random() * 30 + 70}%`}
          speed={speed}
          startColor="gray.100"
          endColor="gray.200"
        />
      ))}
    </VStack>
  );
};

export default {
  MemoryCardSkeleton,
  ListItemSkeleton,
  NavigationSkeleton,
  ProfileSkeleton,
  ContentSkeleton,
};

/**
 * Usage Examples:
 * 
 * // Memory cards loading
 * {isLoading ? (
 *   <MemoryCardSkeleton count={6} />
 * ) : (
 *   <MemoryGrid memories={memories} />
 * )}
 * 
 * // List items loading
 * {isLoading ? (
 *   <ListItemSkeleton count={10} height="80px" />
 * ) : (
 *   <CommentsList comments={comments} />
 * )}
 * 
 * // Profile loading
 * {isLoading ? (
 *   <ProfileSkeleton />
 * ) : (
 *   <UserProfile user={user} />
 * )}
 */