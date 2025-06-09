import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  VStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  Button, 
  Spinner, 
  Alert, 
  AlertIcon,
  useToast,
  Flex,
  Text
} from '@chakra-ui/react';
import GoogleMap from '../components/GoogleMap';
import type { MapData, MapsResponse } from '../components/types';
import useApi from '../hooks/useApi';
import useMemberStore from '../store/memberStore';

interface MemoryFormData {
  title: string;
  content: string;
  locationName: string;
  mapId: number | null;
}

const CreateMemoryPage: React.FC = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [formData, setFormData] = useState<MemoryFormData>({
    title: '',
    content: '',
    locationName: '',
    mapId: null
  });
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const api = useApi();
  const { isAuthenticated } = useMemberStore();
  const toast = useToast();

  // Fetch maps from the API
  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<MapsResponse>('/v1/maps/member');
      setMaps(response.data.data || []);
    } catch (err) {
      console.error('Error fetching maps:', err);
      setError('Failed to load maps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaps();
    }
  }, [isAuthenticated]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle map marker click
  const handleMapClick = (map: MapData) => {
    setSelectedMap(map);
    setFormData(prev => ({
      ...prev,
      mapId: map.id,
      locationName: map.name
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.locationName.trim()) {
      toast({
        title: 'Location name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.mapId) {
      toast({
        title: 'Please select a map',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      // Send the form data to the API
      await api.post('/v1/memories', formData);

      // Show success message
      toast({
        title: 'Memory created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        locationName: '',
        mapId: null
      });
      setSelectedMap(null);

    } catch (err) {
      console.error('Error creating memory:', err);
      toast({
        title: 'Failed to create memory',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" p={4} flex="1">
      <Heading as="h1" size="xl" mb={6}>Create Memory</Heading>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* Form section */}
        <Box width={{ base: '100%', md: '40%' }}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Enter memory title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Content</FormLabel>
                <Textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  placeholder="Describe your memory"
                  minHeight="150px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location Name</FormLabel>
                <Input 
                  name="locationName" 
                  value={formData.locationName} 
                  onChange={handleInputChange} 
                  placeholder="Enter location name"
                  readOnly={!!selectedMap}
                />
              </FormControl>

              {selectedMap && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Selected map: {selectedMap.name} (ID: {selectedMap.id})
                </Alert>
              )}

              <Button 
                type="submit" 
                colorScheme="blue" 
                isLoading={submitting}
                loadingText="Creating"
                mt={4}
              >
                Create Memory
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Map section */}
        <Box width={{ base: '100%', md: '60%' }} height="500px" position="relative">
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

          <Box mb={4}>
            <Text fontWeight="bold">Click on a map marker to select a location for your memory</Text>
          </Box>

          <GoogleMap 
            apiKey={googleMapsApiKey} 
            maps={maps}
            onMapSelect={handleMapClick}
          />
        </Box>
      </Flex>
    </Container>
  );
};

export default CreateMemoryPage;
