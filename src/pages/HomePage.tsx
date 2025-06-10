import React, { useState, useEffect } from 'react';
import { Container, Flex, Box, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import GoogleMap from '../components/GoogleMap';
import type {LocationData, MapData} from '../types';
import UpcomingEvents from '../components/UpcomingEvents';
import SaveMap from '../components/SaveMap';
import useApi from '../hooks/useApi';
import useMemberStore from '../store/memberStore';

const HomePage: React.FC = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { isAuthenticated } = useMemberStore();

  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine which endpoint to use based on authentication status
      const endpoint = isAuthenticated 
        ? '/v1/maps/member'
        : '/v1/maps';

      const response = await api.get<MapData[]>(endpoint);
      setMaps(response.data.data || []);
    } catch (err) {
      console.error('Error fetching maps:', err);
      setError('Failed to load maps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, [isAuthenticated]);

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
            <Box width="66.67%" height="100%" position="relative">
              {loading && (
                <Box 
                  position="absolute" 
                  top="0" 
                  left="0" 
                  width="100%" 
                  height="100%" 
                  bg="rgba(255, 255, 255, 0.7)" 
                  zIndex="1" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Spinner size="xl" />
                </Box>
              )}

              {error && (
                <Box 
                  position="absolute" 
                  top="4" 
                  left="4" 
                  zIndex="1" 
                  maxWidth="80%"
                >
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                </Box>
              )}

              <GoogleMap 
                apiKey={googleMapsApiKey} 
                onLocationSelect={handleLocationSelect}
                maps={maps}
              />
            </Box>

            {/* Content - takes up 1/3 of the screen width */}
            <Box width="33.33%" height="100%">
              {/* Top section - Upcoming events */}
              <UpcomingEvents />

              {/* Bottom section - Save a map */}
              <SaveMap 
                selectedLocation={selectedLocation} 
                onMapSaved={fetchMaps}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};

export default HomePage;
