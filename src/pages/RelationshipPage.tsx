import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';

const RelationshipPage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <Heading as="h1" size="xl" mb={6}>Relationship</Heading>
      </Box>
    </Container>
  );
};

export default RelationshipPage;
