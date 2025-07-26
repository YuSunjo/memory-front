import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Box, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';
import type {LocationData, MapData} from '../types';
import ResponsiveUpcomingEvents from '../components/ResponsiveUpcomingEvents';
import SaveMap from '../components/SaveMap';
import useApi from '../hooks/useApi';
import useMemberStore from '../store/memberStore';
import { 
  GradientButton, 
  ResponsiveGrid, 
  ResponsiveContainer,
  HeroSection,
  Card,
  Title,
  ScrollAnimation,
  StaggerContainer
} from '../components/design-system';

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

  const fetchMaps = useCallback(async () => {
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
  }, [isAuthenticated, api]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  return (
    <ResponsiveContainer maxWidth="xl" padding centerContent>
      {/* Welcome Hero Section */}
      <ScrollAnimation animation="fadeIn" duration={0.8}>
        <HeroSection
          mb={8}
          title="소중한 순간을 영원히 ✨"
          subtitle="당신만의 추억 아카이브를 만들어보세요. 매일의 특별한 순간들이 아름다운 이야기가 됩니다."
          variant="card"
          animated
        />
      </ScrollAnimation>

      <Flex direction="column" gap={6}>
        {/* Responsive Dashboard Grid */}
        <StaggerContainer staggerDelay={0.2} childAnimation="slideUp">
          <ResponsiveGrid 
            layout="dashboard" 
            gap={6} 
            minHeight={{ base: 'auto', lg: '500px' }}
          >
          {/* Interactive Map Section */}
          <Card 
            position="relative"
            overflow="hidden"
            minHeight={{ base: '300px', md: '400px', lg: '500px' }}
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
          </Card>

          {/* Dashboard Sidebar */}
          <Flex direction="column" gap={4} height="100%">
            {/* Quick Actions */}
            <Card 
              p={6} 
              flex={{ base: 'none', lg: '0 0 40%' }}
            >
              <Title 
                gradient 
                mb={4}
              >
                🚀 빠른 시작
              </Title>
              <Flex direction="column" gap={3}>
                <GradientButton
                  leftIcon={<span>📝</span>}
                  size="md"
                  onClick={() => navigate('/create-memory')}
                >
                  지금 이 순간을 영원히 ✨
                </GradientButton>
                <GradientButton
                  leftIcon={<span>💝</span>}
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/my-memories')}
                >
                  나만의 추억 보물상자 💎
                </GradientButton>
              </Flex>
            </Card>

            {/* Upcoming Events */}
            <Box flex="1">
              <ResponsiveUpcomingEvents />
            </Box>
          </Flex>
          </ResponsiveGrid>

          {/* Save Map Section */}
          <Card 
            p={6} 
          >
            <SaveMap 
              selectedLocation={selectedLocation} 
              onMapSaved={fetchMaps}
            />
          </Card>
        </StaggerContainer>
      </Flex>
    </ResponsiveContainer>
  );
};

export default HomePage;
