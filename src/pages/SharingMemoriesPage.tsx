import React from 'react';
import { Container, Box, Heading, Text } from '@chakra-ui/react';

const SharingMemoriesPage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="800px">
        <Heading as="h1" size="xl" mb={4}>Sharing Memories</Heading>
        <Text fontSize="lg" color="gray.600">
          This page will display memories that you've shared with others.
        </Text>
      </Box>
    </Container>
  );
};

export default SharingMemoriesPage;