import React from 'react';
import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import useMemberStore from '../store/memberStore';
import HomePage from '../pages/HomePage';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/ProfileEditPage';
import RelationshipPage from '../pages/RelationshipPage';
import MemoriesWithRelationshipPage from '../pages/MemoriesWithRelationshipPage';
import MyMemoriesPage from '../pages/MyMemoriesPage';
import CreateMemoryPage from '../pages/CreateMemoryPage';
import SharingMemoriesPage from '../pages/SharingMemoriesPage';
import CalendarPage from '../pages/CalendarPage';
import MemoryQuestPage from '../pages/MemoryQuestPage';
import AboutPage from '../pages/AboutPage';
import LinkPage from '../pages/LinkPage';
import MemoryDetailPage from '../pages/MemoryDetailPage';
import IntroBanner from './IntroBanner';
import ResponsiveNavbar from './ResponsiveNavbar';
import FloatingActionButton from './FloatingActionButton';
import { MobileNavigation, PageTransition } from './design-system';

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
      <PageTransition variant="slide" duration={0.3}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/relationship" element={<RelationshipPage />} />
          <Route path="/memories-with-relationship" element={<MemoriesWithRelationshipPage />} />
          <Route path="/my-memories" element={<MyMemoriesPage />} />
          <Route path="/create-memory" element={<CreateMemoryPage />} />
          <Route path="/sharing-memories" element={<SharingMemoriesPage />} />
          <Route path="/memory-quest" element={<MemoryQuestPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/link-page/:memberId" element={<LinkPage />} />
          <Route path="/memory/:memoryId" element={<MemoryDetailPage />} />
        </Routes>
      </PageTransition>
      
      {/* Floating Action Button - 로그인 사용자에게만 표시 (Create Memory 페이지 제외) */}
      <FloatingActionButton isVisible={shouldShowFAB} />
      
      {/* Mobile Navigation - 인증된 사용자에게만 표시 */}
      {isAuthenticated && <MobileNavigation />}
    </Box>
  );
};

export default AppContent;