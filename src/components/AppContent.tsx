import React from 'react';
import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import useMemberStore from '../store/memberStore';
import IntroBanner from './IntroBanner';
import ResponsiveNavbar from './ResponsiveNavbar';
import FloatingActionButton from './FloatingActionButton';
import { MobileNavigation } from './design-system';
import {
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
  SuspenseRoute
} from './LazyRoutes';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useMemberStore();
  
  // 로그인 상태이고 Create Memory 페이지가 아닐 때만 FAB를 표시
  // 모바일에서는 네비게이션에 Create 버튼이 있으므로 FAB 숨김
  const shouldShowFAB = isAuthenticated && location.pathname !== '/create-memory';

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        zIndex: -1
      }}
    >
      <IntroBanner />
      <ResponsiveNavbar />
      <Routes>
        <Route path="/" element={
          <SuspenseRoute routeName="홈">
            <LazyHomePage />
          </SuspenseRoute>
        } />
        <Route path="/signup" element={
          <SuspenseRoute routeName="회원가입">
            <LazySignupPage />
          </SuspenseRoute>
        } />
        <Route path="/login" element={
          <SuspenseRoute routeName="로그인">
            <LazyLoginPage />
          </SuspenseRoute>
        } />
        <Route path="/profile" element={
          <SuspenseRoute routeName="프로필">
            <LazyProfilePage />
          </SuspenseRoute>
        } />
        <Route path="/profile/edit" element={
          <SuspenseRoute routeName="프로필 편집">
            <LazyProfileEditPage />
          </SuspenseRoute>
        } />
        <Route path="/relationship" element={
          <SuspenseRoute routeName="소중한 사람들">
            <LazyRelationshipPage />
          </SuspenseRoute>
        } />
        <Route path="/memories-with-relationship" element={
          <SuspenseRoute routeName="함께한 추억">
            <LazyMemoriesWithRelationshipPage />
          </SuspenseRoute>
        } />
        <Route path="/my-memories" element={
          <SuspenseRoute routeName="내 추억">
            <LazyMyMemoriesPage />
          </SuspenseRoute>
        } />
        <Route path="/create-memory" element={
          <SuspenseRoute routeName="추억 만들기">
            <LazyCreateMemoryPage />
          </SuspenseRoute>
        } />
        <Route path="/sharing-memories" element={
          <SuspenseRoute routeName="추억 공유">
            <LazySharingMemoriesPage />
          </SuspenseRoute>
        } />
        <Route path="/memory-quest" element={
          <SuspenseRoute routeName="추억 탐험">
            <LazyMemoryQuestPage />
          </SuspenseRoute>
        } />
        <Route path="/calendar" element={
          <SuspenseRoute routeName="캘린더">
            <LazyCalendarPage />
          </SuspenseRoute>
        } />
        <Route path="/about" element={
          <SuspenseRoute routeName="소개">
            <LazyAboutPage />
          </SuspenseRoute>
        } />
        <Route path="/link-page/:memberId" element={
          <SuspenseRoute routeName="링크">
            <LazyLinkPage />
          </SuspenseRoute>
        } />
        <Route path="/memory/:memoryId" element={
          <SuspenseRoute routeName="추억 상세">
            <LazyMemoryDetailPage />
          </SuspenseRoute>
        } />
      </Routes>
      
      {/* Floating Action Button - 로그인 사용자에게만 표시 (Create Memory 페이지 제외) */}
      <FloatingActionButton isVisible={shouldShowFAB} />
      
      {/* Mobile Navigation - 인증된 사용자에게만 표시 */}
      {isAuthenticated && <MobileNavigation />}
    </Box>
  );
};

export default AppContent;