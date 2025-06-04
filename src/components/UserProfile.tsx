import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, fetchUserInfo, logout } = useUserStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if user is authenticated but user data is not loaded
    if (isAuthenticated && !user) {
      fetchUserInfo();
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, user, fetchUserInfo, navigate, isLoading]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading user information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" color="red.500">Error</Heading>
        <Text mt={4}>{error}</Text>
        <Button mt={4} onClick={() => fetchUserInfo()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No user information available</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} rounded="md" shadow="md" w="100%">
      <VStack spacing={4} align="stretch">
        <Heading size="lg">User Profile</Heading>
        
        <Box>
          <Text fontWeight="bold">Email:</Text>
          <Text>{user.email}</Text>
        </Box>
        
        <Box>
          <Text fontWeight="bold">Name:</Text>
          <Text>{user.name}</Text>
        </Box>
        
        <Box>
          <Text fontWeight="bold">Nickname:</Text>
          <Text>{user.nickname}</Text>
        </Box>
        
        <Button colorScheme="red" onClick={handleLogout} mt={4}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default UserProfile;