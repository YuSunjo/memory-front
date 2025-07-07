import React, { useState } from 'react';
import { Flex, Box, Heading, Button, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, Text, Badge, Center} from '@chakra-ui/react';
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
      bg="white"
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      width="100%"
    >
      <Box>
        <Box 
          cursor="pointer" 
          onClick={() => {
            navigate('/');
          }}
        >
          <Heading as="h1" size="md" fontWeight="bold" color="gray.700">
            Memory
          </Heading>
        </Box>
        <HStack spacing={4} mt={2}>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/memories-with-relationship' ? "bold" : "normal"}
            color={location.pathname === '/memories-with-relationship' ? "blue.500" : "gray.600"} 
            cursor="pointer" 
            _hover={{ color: "blue.500" }}
            onClick={() => navigate('/memories-with-relationship')}
            borderBottom={location.pathname === '/memories-with-relationship' ? "2px solid" : "none"}
            borderColor="blue.500"
            pb={1}
          >
            Memories with relationship
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/my-memories' ? "bold" : "normal"}
            color={location.pathname === '/my-memories' ? "blue.500" : "gray.600"} 
            cursor="pointer" 
            _hover={{ color: "blue.500" }}
            onClick={() => navigate('/my-memories')}
            borderBottom={location.pathname === '/my-memories' ? "2px solid" : "none"}
            borderColor="blue.500"
            pb={1}
          >
            My Memories
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/sharing-memories' ? "bold" : "normal"}
            color={location.pathname === '/sharing-memories' ? "blue.500" : "gray.600"} 
            cursor="pointer" 
            _hover={{ color: "blue.500" }}
            onClick={() => navigate('/sharing-memories')}
            borderBottom={location.pathname === '/sharing-memories' ? "2px solid" : "none"}
            borderColor="blue.500"
            pb={1}
          >
            Sharing Memories
          </Text>
          <Text 
            fontSize="sm" 
            fontWeight={location.pathname === '/memory-quest' ? "bold" : "normal"}
            color={location.pathname === '/memory-quest' ? "blue.500" : "gray.600"} 
            cursor="pointer" 
            _hover={{ color: "blue.500" }}
            onClick={() => navigate('/memory-quest')}
            borderBottom={location.pathname === '/memory-quest' ? "2px solid" : "none"}
            borderColor="blue.500"
            pb={1}
          >
            🎮 Memory Quest
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
              <MenuList>
                <MenuItem onClick={() => navigate('/profile')}>
                  <Text fontWeight="bold">Profile</Text>
                </MenuItem>
                <MenuItem onClick={() => navigate('/relationship')}>
                  <Text fontWeight="bold">Relationship</Text>
                </MenuItem>
                <MenuItem onClick={() => navigate('/calendar')}>
                  <Text fontWeight="bold">Calendar</Text>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Text color="red.500">Logout</Text>
                </MenuItem>
              </MenuList>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              color="gray.700" 
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              bg="#646cff" 
              color="white" 
              _hover={{ bg: '#535bf2' }}
              onClick={() => navigate('/signup')}
            >
              SignUp
            </Button>
          </>
        )}
      </HStack>
    </Flex>
  );
};

export default Navbar;
