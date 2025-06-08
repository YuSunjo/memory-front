import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Input, Button, useToast } from '@chakra-ui/react';

const SaveMap: React.FC = () => {
  const [mapName, setMapName] = useState<string>('');
  const [mapDescription, setMapDescription] = useState<string>('');
  const toast = useToast();

  const handleSaveMap = () => {
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

    // Here you would typically make an API call to save the map
    console.log('Saving map:', { name: mapName, description: mapDescription });

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
  };

  return (
    <Box height="50%" p={4}>
      <VStack spacing={4} align="start">
        <Heading as="h2" size="lg" color="gray.700">Save a map</Heading>
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
          >
            Save
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SaveMap;