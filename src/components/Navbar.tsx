import React from 'react';
import { Flex, Box, Heading, Button, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

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
        <Heading as="h1" size="md" fontWeight="bold" color="gray.700">
          Memory
        </Heading>
      </Box>
      <HStack spacing={4}>
        <Button variant="ghost" color="gray.700" _hover={{ bg: 'gray.100' }}>
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
      </HStack>
    </Flex>
  );
};

export default Navbar;
