import React, { useEffect } from 'react';
import { Heading, Text, VStack, Container } from '@chakra-ui/react';
import useUserStore from '../store/userStore';

const HomePage: React.FC = () => {
  const { isAuthenticated, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated, fetchUserInfo]);

  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <VStack spacing={4} textAlign="center">
        <Heading as="h1" size="2xl" color="gray.700">Welcome to Memory</Heading>
        <Text fontSize="xl" color="gray.600">A place to record your precious memories</Text>
      </VStack>
    </Container>
  );
};

export default HomePage;
