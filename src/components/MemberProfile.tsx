import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  useToast,
  Image,
  Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';

const MemberProfile: React.FC = () => {
  const { member, isAuthenticated, isLoading, error, fetchMemberInfo, logout } = useMemberStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated && !member) {
      fetchMemberInfo();
    }

    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, member, fetchMemberInfo, navigate, isLoading]);

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
        <Text mt={4}>Loading member information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" color="red.500">Error</Heading>
        <Text mt={4}>{error}</Text>
        <Button mt={4} onClick={() => fetchMemberInfo()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!member) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No member information available</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} rounded="md" shadow="md" w="100%">
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Member Profile</Heading>
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </Flex>

        <Box>
          <Text fontWeight="bold">Email:</Text>
          <Text>{member.email}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Name:</Text>
          <Text>{member.name}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Nickname:</Text>
          <Text>{member.nickname}</Text>
        </Box>

        {member.profileImageUrl && (
          <Box>
            <Text fontWeight="bold">Profile Image:</Text>
            <Image 
              src={member.profileImageUrl} 
              alt="Profile" 
              boxSize="150px" 
              objectFit="cover" 
              borderRadius="md" 
              mt={2}
            />
          </Box>
        )}

        <Button colorScheme="red" onClick={handleLogout} mt={4}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default MemberProfile;
