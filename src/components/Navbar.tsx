import React, { useState } from 'react';
import { Flex, Box, Button, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, Text, Badge, Center, Image} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import useMemberStore from '../store/memberStore';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, member, logout } = useMemberStore();
  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New comment on your memory", read: false },
    { id: 2, text: "Someone liked your memory", read: false },
    { id: 3, text: "New follower", read: true }
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

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      padding="1rem 2rem"
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
      borderBottom="1px solid rgba(255, 255, 255, 0.18)"
      width="100%"
      position="sticky"
      top="0"
      zIndex="100"
      transition="all 0.3s ease"
    >
      <Box>
        <Box>
          <Image 
            src="/memory-logo-navbar.png"
            alt="Memory Logo" 
            height="64px" 
            objectFit="contain"
            cursor="pointer" 
            onClick={() => {
              navigate('/');
            }}
          />
        </Box>
        <HStack spacing={6} mt={2}>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/my-memories' ? "bold" : "medium"}
            color={location.pathname === '/my-memories' ? "white" : "gray.700"} 
            cursor="pointer" 
            _hover={{ 
              color: "white",
              transform: "translateY(-2px)",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
            onClick={() => navigate('/my-memories')}
            bg={location.pathname === '/my-memories' ? "linear-gradient(45deg, #667eea, #764ba2)" : "transparent"}
            px={location.pathname === '/my-memories' ? 4 : 0}
            py={location.pathname === '/my-memories' ? 2 : 1}
            borderRadius="full"
            transition="all 0.3s ease"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <span>💝</span> 추억 갤러리
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/memories-with-relationship' ? "bold" : "medium"}
            color={location.pathname === '/memories-with-relationship' ? "white" : "gray.700"} 
            cursor="pointer" 
            _hover={{ 
              color: "white",
              transform: "translateY(-2px)",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
            onClick={() => navigate('/memories-with-relationship')}
            bg={location.pathname === '/memories-with-relationship' ? "linear-gradient(45deg, #667eea, #764ba2)" : "transparent"}
            px={location.pathname === '/memories-with-relationship' ? 4 : 0}
            py={location.pathname === '/memories-with-relationship' ? 2 : 1}
            borderRadius="full"
            transition="all 0.3s ease"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <span>👥</span> 함께한 순간
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/sharing-memories' ? "bold" : "medium"}
            color={location.pathname === '/sharing-memories' ? "white" : "gray.700"} 
            cursor="pointer" 
            _hover={{ 
              color: "white",
              transform: "translateY(-2px)",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
            onClick={() => navigate('/sharing-memories')}
            bg={location.pathname === '/sharing-memories' ? "linear-gradient(45deg, #667eea, #764ba2)" : "transparent"}
            px={location.pathname === '/sharing-memories' ? 4 : 0}
            py={location.pathname === '/sharing-memories' ? 2 : 1}
            borderRadius="full"
            transition="all 0.3s ease"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <span>🌟</span> 발견하기
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/memory-quest' ? "bold" : "medium"}
            color={location.pathname === '/memory-quest' ? "white" : "gray.700"} 
            cursor="pointer" 
            _hover={{ 
              color: "white",
              transform: "translateY(-2px)",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
            }}
            onClick={() => navigate('/memory-quest')}
            bg={location.pathname === '/memory-quest' ? "linear-gradient(45deg, #667eea, #764ba2)" : "transparent"}
            px={location.pathname === '/memory-quest' ? 4 : 0}
            py={location.pathname === '/memory-quest' ? 2 : 1}
            borderRadius="full"
            transition="all 0.3s ease"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <span>🎯</span> 추억 탐험
          </Text>
        </HStack>
      </Box>
      <HStack spacing={4}>
        {isAuthenticated ? (
          <>
            <Menu>
              <MenuButton position="relative">
                <Box position="relative">
                  <Center 
                    w="32px" 
                    h="32px" 
                    borderRadius="full" 
                    bg="gray.100" 
                    cursor="pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
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
              </MenuButton>
              <MenuList>
                <Box px={3} py={2} borderBottomWidth="1px">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">Notifications</Text>
                    {unreadCount > 0 && (
                      <Text 
                        fontSize="xs" 
                        color="blue.500" 
                        cursor="pointer" 
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </Text>
                    )}
                  </Flex>
                </Box>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <MenuItem 
                      key={notification.id} 
                      onClick={() => markAsRead(notification.id)}
                      bg={notification.read ? "white" : "blue.50"}
                    >
                      <Text fontSize="sm">{notification.text}</Text>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem>
                    <Text fontSize="sm">No notifications</Text>
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton>
                <Avatar 
                  size="sm" 
                  name={member?.name || member?.nickname} 
                  src={member?.profile?.fileUrl}
                  bg="blue.500" 
                  color="white"
                  cursor="pointer"
                />
              </MenuButton>
              <MenuList borderRadius="xl" boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)">
                <MenuItem onClick={() => navigate('/profile')} borderRadius="lg" _hover={{ bg: 'purple.50' }}>
                  <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                    <span>👤</span> 내 프로필
                  </Text>
                </MenuItem>
                <MenuItem onClick={() => navigate('/relationship')} borderRadius="lg" _hover={{ bg: 'purple.50' }}>
                  <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                    <span>💕</span> 소중한 사람들
                  </Text>
                </MenuItem>
                <MenuItem onClick={() => navigate('/calendar')} borderRadius="lg" _hover={{ bg: 'purple.50' }}>
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
            <Button 
              variant="ghost" 
              color="gray.700" 
              _hover={{ 
                bg: 'rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
              transition="all 0.3s ease"
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
            <Button 
              bg="linear-gradient(45deg, #667eea, #764ba2)" 
              color="white" 
              _hover={{ 
                bg: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }}
              transition="all 0.3s ease"
              borderRadius="full"
              px={6}
              onClick={() => navigate('/signup')}
            >
              시작하기 ✨
            </Button>
          </>
        )}
      </HStack>
    </Flex>
  );
};

export default Navbar;
