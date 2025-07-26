import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Input, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import type {LocationData} from '../types';
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
      toast({
        title: 'Failed to create map',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="start">
        <Heading 
          as="h2" 
          size="lg" 
          bgGradient="linear(45deg, #667eea, #764ba2)"
          bgClip="text"
          fontWeight="bold"
        >
          📍 특별한 장소 저장하기
        </Heading>

        {selectedLocation ? (
          <Alert status="info" borderRadius="xl" bg="blue.50" borderColor="blue.200">
            <AlertIcon />
            <Text color="blue.700">선택된 장소: {selectedLocation.address}</Text>
          </Alert>
        ) : (
          <Alert status="info" borderRadius="xl" bg="purple.50" borderColor="purple.200">
            <AlertIcon />
            <Text color="purple.700">지도에서 추억을 만들고 싶은 장소를 클릭해보세요 ✨</Text>
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
            <Text mb={2} fontWeight="medium" color="gray.700">💝 장소의 이름</Text>
            <Input 
              placeholder="예: 우리가 처음 만난 카페" 
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.300" }}
              _focus={{ 
                borderColor: "purple.500", 
                boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.3)" 
              }}
              transition="all 0.3s ease"
            />
          </Box>
          <Box width="100%">
            <Text mb={2} fontWeight="medium" color="gray.700">📖 추억의 설명</Text>
            <Input 
              placeholder="이곳에서의 특별한 기억을 남겨보세요..." 
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.300" }}
              _focus={{ 
                borderColor: "purple.500", 
                boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.3)" 
              }}
              transition="all 0.3s ease"
            />
          </Box>
          <Button 
            bg="linear-gradient(45deg, #667eea, #764ba2)"
            color="white"
            mt={4}
            borderRadius="xl"
            px={6}
            py={6}
            fontSize="md"
            fontWeight="bold"
            onClick={handleSaveMap}
            isLoading={isSaving}
            loadingText="저장 중..."
            isDisabled={!selectedLocation}
            _hover={{
              bg: "linear-gradient(45deg, #5a6fd8, #6a4190)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)"
            }}
            _active={{
              transform: "translateY(0px)"
            }}
            transition="all 0.3s ease"
            leftIcon={<span>💾</span>}
          >
            추억 저장하기
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SaveMap;
