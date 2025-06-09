import React from 'react';
import { Container, Box, Heading, Text, VStack } from '@chakra-ui/react';

const CreateMemoryPage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <Heading as="h1" size="xl" mb={6}>Create Memory</Heading>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" color="gray.600">
            This page will contain a form for creating a new memory.
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default CreateMemoryPage;