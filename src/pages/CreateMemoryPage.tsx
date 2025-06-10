import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Text,
  RadioGroup,
  Radio,
  HStack
} from '@chakra-ui/react';
import GoogleMap from '../components/GoogleMap';
import useApi from '../hooks/useApi';
import useMemberStore from '../store/memberStore';
import type {LocationData, MapData, MapFormData, MemoryFormData} from "../types";

const CreateMemoryPage: React.FC = () => {
  const navigate = useNavigate();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [formData, setFormData] = useState<MemoryFormData>({
    title: '',
    content: '',
    locationName: '',
    mapId: null,
    memoryType: 'PUBLIC'
  });
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const api = useApi();
  const { isAuthenticated } = useMemberStore();
  const toast = useToast();

  // Fetch maps from the API
  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<MapData[]>('/v1/maps/member');
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

  // Handle memory type change
  const handleMemoryTypeChange = (value: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP') => {
    setFormData(prev => ({
      ...prev,
      memoryType: value
    }));
  };

  // Handle map marker click
  const handleMapClick = (map: MapData) => {
    setSelectedMap(map);
    setSelectedLocation(null); // Clear selected location when a map is selected
    setFormData(prev => ({
      ...prev,
      mapId: map.id,
      locationName: map.name
    }));
  };

  // Handle location select (when clicking on the map)
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setSelectedMap(null); // Clear selected map when a location is selected
    setFormData(prev => ({
      ...prev,
      mapId: null,
      locationName: location.address
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

    // Check if we have either a selected map or a selected location
    if (!formData.mapId && !selectedLocation) {
      toast({
        title: 'Please select a location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      let mapId = formData.mapId;

      // If no map is selected but a location is selected, create a new map first
      if (!mapId && selectedLocation) {
        // Prepare map data
        const mapData: MapFormData = {
          name: formData.locationName,
          description: formData.locationName,
          address: selectedLocation.address,
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
          mapType: "USER_PLACE"
        };

        try {
          // Create a new map
          const mapResponse = await api.post<MapData, MapFormData>('/v1/maps', mapData)
          mapId = mapResponse.data.data.id;
        } catch (mapErr) {
          console.error('Error creating map:', mapErr);
          toast({
            title: 'Failed to create map',
            description: 'Please try again later',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          throw mapErr;
        }
      }

      // Send the form data to the API with the map ID
      await api.post('/v1/memories', {
        ...formData,
        mapId
      });

      toast({
        title: 'Memory created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (formData.memoryType === 'PUBLIC') {
        navigate('/sharing-memories');
      } else if (formData.memoryType === 'PRIVATE') {
        navigate('/my-memories');
      } else if (formData.memoryType === 'RELATIONSHIP') {
        navigate('/memories-with-gf');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        locationName: '',
        mapId: null,
        memoryType: 'PUBLIC'
      });
      setSelectedMap(null);
      setSelectedLocation(null);

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

              <FormControl isRequired>
                <FormLabel>Memory Type</FormLabel>
                <RadioGroup 
                  value={formData.memoryType} 
                  onChange={handleMemoryTypeChange}
                >
                  <HStack spacing={4}>
                    <Radio value="PUBLIC">Public</Radio>
                    <Radio value="PRIVATE">Private</Radio>
                    <Radio value="RELATIONSHIP">Relationship</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {selectedMap && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Selected map: {selectedMap.name} (ID: {selectedMap.id})
                </Alert>
              )}

              {selectedLocation && !selectedMap && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Selected location: {selectedLocation.address}
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
            onLocationSelect={handleLocationSelect}
          />
        </Box>
      </Flex>
    </Container>
  );
};

export default CreateMemoryPage;
