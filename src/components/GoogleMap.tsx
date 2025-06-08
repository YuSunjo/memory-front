import React from 'react';
import { Box } from '@chakra-ui/react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader } from '@react-google-maps/api';

interface GoogleMapProps {
  apiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px'
};

const center = {
  lat: 37.5665,
  lng: 126.9780 // Default to Seoul, Korea
};

const GoogleMap: React.FC<GoogleMapProps> = ({ apiKey }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return <Box>Error loading maps</Box>;
  }

  if (!isLoaded) {
    return <Box>Loading maps</Box>;
  }

  return (
    <Box 
      width="100%" 
      height="100%" 
      minHeight="500px"
      borderRadius="md"
      overflow="hidden"
    >
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
    </Box>
  );
};

export default GoogleMap;
