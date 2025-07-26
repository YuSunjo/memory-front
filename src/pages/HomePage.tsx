import React, { useState, useEffect } from 'react';
import { Container, Flex, Box, Spinner, Alert, AlertIcon, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sharing-memories');
    }
  }, [isAuthenticated, navigate]);

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
    <Container maxW="container.xl" p={6} flex="1">
      {/* Welcome Hero Section */}
      <Box 
        mb={8} 
        p={8} 
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(20px)"
        borderRadius="3xl"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
        textAlign="center"
      >
        <Text 
          fontSize="3xl" 
          fontWeight="bold" 
          bgGradient="linear(45deg, #667eea, #764ba2)"
          bgClip="text"
          mb={4}
        >
          안녕하세요! 오늘도 특별한 하루를 기록해보세요 ✨
        </Text>
        <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
          당신의 소중한 순간들이 아름다운 추억으로 남을 수 있도록 도와드릴게요
        </Text>
      </Box>

      <Flex direction="column" gap={6}>
        {/* Dashboard Grid */}
        <Flex height="500px" gap={6}>
          {/* Interactive Map Section */}
          <Box 
            width="60%" 
            height="100%" 
            position="relative"
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
          >
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

          {/* Dashboard Sidebar */}
          <Box width="40%" height="100%" display="flex" flexDirection="column" gap={4}>
            {/* Quick Actions */}
            <Box 
              p={6} 
              bg="rgba(255, 255, 255, 0.8)"
              backdropFilter="blur(10px)"
              borderRadius="2xl"
              boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
              height="40%"
            >
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                mb={4}
                bgGradient="linear(45deg, #667eea, #764ba2)"
                bgClip="text"
              >
                🚀 빠른 시작
              </Text>
              <Flex direction="column" gap={3}>
                <Button
                  leftIcon={<span>📝</span>}
                  bg="linear-gradient(45deg, #667eea, #764ba2)"
                  color="white"
                  borderRadius="xl"
                  _hover={{
                    bg: "linear-gradient(45deg, #5a6fd8, #6a4190)",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s ease"
                  onClick={() => navigate('/create-memory')}
                >
                  새로운 추억 만들기
                </Button>
                <Button
                  leftIcon={<span>💝</span>}
                  variant="outline"
                  borderColor="purple.300"
                  color="purple.600"
                  borderRadius="xl"
                  _hover={{
                    bg: "purple.50",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s ease"
                  onClick={() => navigate('/my-memories')}
                >
                  내 갤러리 보기
                </Button>
              </Flex>
            </Box>

            {/* Upcoming Events */}
            <UpcomingEvents />
          </Box>
        </Flex>

        {/* Save Map Section */}
        <Box 
          p={6} 
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(10px)"
          borderRadius="2xl"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
        >
          <SaveMap 
            selectedLocation={selectedLocation} 
            onMapSaved={fetchMaps}
          />
        </Box>
      </Flex>
    </Container>
  );
};

export default HomePage;
