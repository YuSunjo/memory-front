import React, { useState } from 'react';
import { Heading, Text, VStack, Container, Flex, Box } from '@chakra-ui/react';
import GoogleMap from '../components/GoogleMap';
import type {LocationData} from '../components/types';
import UpcomingEvents from '../components/UpcomingEvents';
import SaveMap from '../components/SaveMap';

const HomePage: React.FC = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  return (
    <Container maxW="container.xl" p={0} flex="1">
      <Flex direction="column" height="calc(100vh - 72px)">
        {/* Google Map - takes up 2/3 of the screen height */}
        <Box height="66.67%" width="100%">
          <Flex height="100%">
            {/* Google Map - takes up 2/3 of the screen width */}
            <Box width="66.67%" height="100%">
              <GoogleMap 
                apiKey={googleMapsApiKey} 
                onLocationSelect={handleLocationSelect}
              />
            </Box>

            {/* Content - takes up 1/3 of the screen width */}
            <Box width="33.33%" height="100%">
              {/* Top section - Upcoming events */}
              <UpcomingEvents />

              {/* Bottom section - Save a map */}
              <SaveMap selectedLocation={selectedLocation} />
            </Box>
          </Flex>
        </Box>

        {/* Bottom section - takes up 1/3 of the screen height */}
        <Box height="33.33%" width="100%" bg="gray.100" p={8}>
          <VStack spacing={4} textAlign="center">
            <Heading as="h2" size="xl" color="gray.700">Explore Your Memories</Heading>
            <Text fontSize="lg" color="gray.600">Discover and share your special moments</Text>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default HomePage;
