import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Input, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import type {LocationData} from './types';
import useApi from '../hooks/useApi';

interface SaveMapProps {
  selectedLocation: LocationData | null;
  onMapSaved?: () => void;
}

const SaveMap: React.FC<SaveMapProps> = ({ selectedLocation, onMapSaved }) => {
  const [mapName, setMapName] = useState<string>('');
  const [mapDescription, setMapDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const api = useApi();

  const handleSaveMap = async () => {
    // Reset error state
    setError(null);

    // Validate inputs
    if (!mapName.trim()) {
      toast({
        title: 'Name is required',
        description: 'Please enter a name for your map',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: 'Location is required',
        description: 'Please select a location on the map',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);

      // Prepare request data
      const mapData = {
        name: mapName,
        description: mapDescription,
        address: selectedLocation.address,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        mapType: "USER_PLACE"
      };

      await api.post('/v1/maps', mapData);
      // Show success toast
      toast({
        title: 'Map saved',
        description: 'Your map has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clear the form
      setMapName('');
      setMapDescription('');

      // Call the onMapSaved callback if provided
      if (onMapSaved) {
        onMapSaved();
      }
    } catch (err) {
      console.error('Error saving map:', err);
      setError('Failed to save map. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box height="50%" p={4}>
      <VStack spacing={4} align="start">
        <Heading as="h2" size="lg" color="gray.700">Save a map</Heading>

        {selectedLocation ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            Selected location: {selectedLocation.address}
          </Alert>
        ) : (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Click on the map to select a location
          </Alert>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <VStack width="100%" spacing={3} align="start">
          <Box width="100%">
            <Text mb={1}>Name</Text>
            <Input 
              placeholder="Enter map name" 
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
            />
          </Box>
          <Box width="100%">
            <Text mb={1}>Description</Text>
            <Input 
              placeholder="Enter map description" 
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
            />
          </Box>
          <Button 
            colorScheme="blue" 
            mt={2}
            onClick={handleSaveMap}
            isLoading={isSaving}
            loadingText="Saving"
            isDisabled={!selectedLocation}
          >
            Save
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SaveMap;
