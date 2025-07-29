import React, { Suspense } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { createLazyRoute } from '../utils/bundleOptimization';
import { PageTransition, ContentSkeleton } from './design-system';
import { designTokens } from '../theme/tokens';

// Loading fallback component
const RouteLoadingFallback: React.FC<{ routeName?: string }> = ({ routeName }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="50vh"
    p={8}
  >
    <VStack spacing={4}>
      <Spinner
        size="xl"
        color={designTokens.colors.brand.primary}
        thickness="3px"
        speed="0.8s"
      />
      <VStack spacing={2}>
        <Text color="gray.600" fontSize="sm" fontWeight="medium">
          {routeName ? `${routeName} 페이지를 불러오는 중...` : '페이지를 불러오는 중...'}
        </Text>
        <Text color="gray.400" fontSize="xs">
          잠시만 기다려주세요
        </Text>
      </VStack>
    </VStack>
  </Box>
);

// Lazy loaded route components with proper error boundaries
export const LazyHomePage = createLazyRoute(
  () => import('../pages/HomePage')
);

export const LazySignupPage = createLazyRoute(
  () => import('../pages/SignupPage')
);

export const LazyLoginPage = createLazyRoute(
  () => import('../pages/LoginPage')
);

export const LazyProfilePage = createLazyRoute(
  () => import('../pages/ProfilePage')
);

export const LazyProfileEditPage = createLazyRoute(
  () => import('../pages/ProfileEditPage')
);

export const LazyRelationshipPage = createLazyRoute(
  () => import('../pages/RelationshipPage')
);

export const LazyMemoriesWithRelationshipPage = createLazyRoute(
  () => import('../pages/MemoriesWithRelationshipPage')
);

export const LazyMyMemoriesPage = createLazyRoute(
  () => import('../pages/MyMemoriesPage')
);

export const LazyCreateMemoryPage = createLazyRoute(
  () => import('../pages/CreateMemoryPage')
);

export const LazySharingMemoriesPage = createLazyRoute(
  () => import('../pages/SharingMemoriesPage')
);

export const LazyCalendarPage = createLazyRoute(
  () => import('../pages/CalendarPage')
);

export const LazyMemoryQuestPage = createLazyRoute(
  () => import('../pages/MemoryQuestPage')
);

export const LazyAboutPage = createLazyRoute(
  () => import('../pages/AboutPage')
);

export const LazyLinkPage = createLazyRoute(
  () => import('../pages/LinkPage')
);

export const LazyMemoryDetailPage = createLazyRoute(
  () => import('../pages/MemoryDetailPage')
);

export const LazySearchPage = createLazyRoute(
  () => import('../pages/SearchPage')
);

// Wrapper component with suspense and error boundary
interface SuspenseRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  routeName?: string;
}

export const SuspenseRoute: React.FC<SuspenseRouteProps> = ({ 
  children, 
  fallback,
  routeName 
}) => (
  <Suspense 
    fallback={
      fallback || <RouteLoadingFallback routeName={routeName} />
    }
  >
    <PageTransition variant="fade" duration={0.2}>
      {children}
    </PageTransition>
  </Suspense>
);

// High-level route wrapper with content skeleton
export const ContentRoute: React.FC<SuspenseRouteProps> = ({ 
  children
}) => (
  <Suspense 
    fallback={
      <Box p={4}>
        <ContentSkeleton />
      </Box>
    }
  >
    <PageTransition variant="slideUp" duration={0.3}>
      {children}
    </PageTransition>
  </Suspense>
);

export default {
  LazyHomePage,
  LazySignupPage,
  LazyLoginPage,
  LazyProfilePage,
  LazyProfileEditPage,
  LazyRelationshipPage,
  LazyMemoriesWithRelationshipPage,
  LazyMyMemoriesPage,
  LazyCreateMemoryPage,
  LazySharingMemoriesPage,
  LazyCalendarPage,
  LazyMemoryQuestPage,
  LazyAboutPage,
  LazyLinkPage,
  LazyMemoryDetailPage,
  LazySearchPage,
  SuspenseRoute,
  ContentRoute
};