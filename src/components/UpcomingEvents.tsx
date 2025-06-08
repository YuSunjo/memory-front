import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';

const UpcomingEvents: React.FC = () => {
  return (
    <Box height="50%" p={4} borderBottom="1px" borderColor="gray.200">
      <VStack spacing={4} align="start">
        <Heading as="h2" size="lg" color="gray.700">Upcoming events</Heading>
        <Text fontSize="md" color="gray.600">No upcoming events found.</Text>
      </VStack>
    </Box>
  );
};

export default UpcomingEvents;