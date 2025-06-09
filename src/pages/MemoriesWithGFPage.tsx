import React from 'react';
import { Container, Box, Heading, Text } from '@chakra-ui/react';

const MemoriesWithGFPage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="800px">
        <Heading as="h1" size="xl" mb={4}>Memories with GF</Heading>
        <Text fontSize="lg" color="gray.600">
          This page will display memories shared with your girlfriend/boyfriend.
        </Text>
      </Box>
    </Container>
  );
};

export default MemoriesWithGFPage;