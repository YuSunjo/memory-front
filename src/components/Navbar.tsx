import React from 'react';
import { Flex, Box, Heading, Button, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, member, logout } = useMemberStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      <HStack spacing={4}>
        {isAuthenticated ? (
          <Menu>
            <MenuButton>
              <Avatar 
                size="sm" 
                name={member?.name || member?.nickname} 
                src={member?.profileImageUrl}
                bg="blue.500" 
                color="white"
                cursor="pointer"
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigate('/profile')}>
                <Text fontWeight="bold">Profile</Text>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Text color="red.500">Logout</Text>
              </MenuItem>
            </MenuList>
          </Menu>
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
