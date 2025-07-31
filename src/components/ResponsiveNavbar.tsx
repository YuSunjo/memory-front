import React, { useState } from 'react';
import { 
  Flex, 
  Box, 
  HStack, 
  Avatar, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Text, 
  Badge, 
  Center, 
  Image,
  useBreakpointValue,
  IconButton
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import useMemberStore from '../store/memberStore';
import { GradientButton, Card } from './design-system';
import { designTokens } from '../theme/tokens';

const ResponsiveNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, member, logout } = useMemberStore();
  
  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([
    { id: 1, text: "새로운 댓글이 달렸습니다", read: false },
    { id: 2, text: "누군가 당신의 추억을 좋아합니다", read: false },
    { id: 3, text: "새로운 팔로워가 생겼습니다", read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Responsive visibility and sizing
  const navItemsVisible = useBreakpointValue({ base: false, lg: true });
  const logoHeight = useBreakpointValue({ base: '48px', md: '56px', lg: '64px' });
  const navPadding = useBreakpointValue({ 
    base: designTokens.spacing.sm, 
    md: designTokens.spacing.md, 
    lg: designTokens.spacing.lg 
  });
  const userActionSpacing = useBreakpointValue({ base: 2, md: 4 });
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' }) as 'sm' | 'md';
  const signupText = useBreakpointValue({ base: '시작', md: '시작하기 ✨' });

  // Navigation items data
  const navItems = [
    { path: '/search', label: '🔍 검색', mobileLabel: '검색' },
    { path: '/my-memories', label: '💝 추억 갤러리', mobileLabel: '추억' },
    { path: '/memories-with-relationship', label: '👥 함께한 순간', mobileLabel: '함께' },
    { path: '/sharing-memories', label: '🌟 발견하기', mobileLabel: '발견' },
    { path: '/memory-quest', label: '🎯 추억 탐험', mobileLabel: '탐험' },
  ];

  // Navigation item component for reusability
  const NavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Text 
        fontSize="sm" 
        fontWeight={isActive ? "bold" : "medium"}
        color={isActive ? "white" : "gray.700"} 
        cursor="pointer" 
        _hover={{ 
          color: "white",
          transform: "translateY(-2px)",
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
        }}
        onClick={() => navigate(item.path)}
        bg={isActive ? designTokens.colors.brand.gradient : "transparent"}
        px={isActive ? 4 : 0}
        py={isActive ? 2 : 1}
        borderRadius="full"
        transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
        display="flex"
        alignItems="center"
        gap={2}
        whiteSpace="nowrap"
      >
        {item.label}
      </Text>
    );
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex={designTokens.zIndex.sticky}
      width="100%"
    >
      <Card
        p={navPadding}
        borderRadius="0"
        border="none"
        borderBottom={`1px solid ${designTokens.colors.glass.border}`}
        bg={designTokens.colors.glass.background}
        backdropFilter="blur(20px)"
      >
        <Flex align="center" justify="space-between">
        {/* Logo and Navigation Section */}
        <Flex align="center" gap={8}>
          {/* Logo */}
          <Image 
            src="/memory-logo-navbar.png"
            alt="Memory Logo" 
            height={logoHeight}
            objectFit="contain"
            cursor="pointer" 
            onClick={() => navigate('/')}
            transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
            _hover={{ transform: 'scale(1.05)' }}
          />
          
          {/* Desktop Navigation Items */}
          {navItemsVisible && (
            <HStack spacing={6} mt={2}>
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </HStack>
          )}
        </Flex>

        {/* User Actions Section */}
        <HStack spacing={userActionSpacing}>
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Menu>
                <MenuButton as={IconButton}
                  icon={
                    <Box position="relative">
                      <Center 
                        w="32px" 
                        h="32px" 
                        borderRadius="full" 
                        bg="gray.100" 
                        cursor="pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                      </Center>
                      {unreadCount > 0 && (
                        <Badge 
                          position="absolute" 
                          top="-5px" 
                          right="-5px" 
                          borderRadius="full" 
                          bg="red.500" 
                          color="white"
                          fontSize="xs"
                          minW="18px"
                          h="18px"
                          textAlign="center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Box>
                  }
                  variant="ghost"
                  aria-label="알림"
                  size="sm"
                />
                <MenuList borderRadius="xl" boxShadow={designTokens.shadows.xl}>
                  <Box px={3} py={2} borderBottomWidth="1px">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="sm">알림</Text>
                      {unreadCount > 0 && (
                        <Text 
                          fontSize="xs" 
                          color="brand.500" 
                          cursor="pointer" 
                          onClick={markAllAsRead}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          모두 읽음
                        </Text>
                      )}
                    </Flex>
                  </Box>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <MenuItem 
                        key={notification.id} 
                        onClick={() => markAsRead(notification.id)}
                        bg={notification.read ? "white" : "brand.50"}
                        _hover={{ bg: 'brand.100' }}
                        borderRadius="md"
                        mx={2}
                        my={1}
                      >
                        <Text fontSize="sm">{notification.text}</Text>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>
                      <Text fontSize="sm" color="gray.500">알림이 없습니다</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
              
              {/* User Profile Menu */}
              <Menu>
                <MenuButton>
                  <Avatar 
                    size={avatarSize}
                    name={member?.name || member?.nickname} 
                    src={member?.profile?.fileUrl}
                    bg="brand.500" 
                    color="white"
                    cursor="pointer"
                    transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
                    _hover={{ transform: 'scale(1.05)', boxShadow: designTokens.shadows.glow }}
                  />
                </MenuButton>
                <MenuList borderRadius="xl" boxShadow={designTokens.shadows.xl}>
                  <MenuItem onClick={() => navigate('/profile')} borderRadius="lg" _hover={{ bg: 'brand.50' }}>
                    <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      <span>👤</span> 내 프로필
                    </Text>
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/relationship')} borderRadius="lg" _hover={{ bg: 'brand.50' }}>
                    <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      <span>💕</span> 소중한 사람들
                    </Text>
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/calendar')} borderRadius="lg" _hover={{ bg: 'brand.50' }}>
                    <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      <span>📅</span> 일정 관리
                    </Text>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} borderRadius="lg" _hover={{ bg: 'red.50' }}>
                    <Text color="red.500" fontWeight="medium" display="flex" alignItems="center" gap={2}>
                      <span>👋</span> 로그아웃
                    </Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <GradientButton 
                variant="ghost"
                size={buttonSize}
                onClick={() => navigate('/login')}
              >
                로그인
              </GradientButton>
              <GradientButton 
                variant="primary"
                size={buttonSize}
                onClick={() => navigate('/signup')}
              >
                {signupText}
              </GradientButton>
            </>
          )}
        </HStack>
        </Flex>
      </Card>
    </Box>
  );
};

export default ResponsiveNavbar;