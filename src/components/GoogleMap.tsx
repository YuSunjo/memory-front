import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker } from '@react-google-maps/api';
import type {LocationData} from './types';

interface GoogleMapProps {
  apiKey: string;
  onLocationSelect?: (location: LocationData) => void;
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

const GoogleMap: React.FC<GoogleMapProps> = ({ apiKey, onLocationSelect }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Initialize geocoder when map is loaded
  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setSelectedPosition(position);

      // Get address from coordinates using geocoder
      if (geocoder) {
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;

            // Pass location data to parent component
            if (onLocationSelect) {
              onLocationSelect({
                latitude: position.lat,
                longitude: position.lng,
                address
              });
            }
          } else {
            console.error('Geocoder failed due to: ' + status);
          }
        });
      }
    }
  }, [geocoder, onLocationSelect]);

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
        onClick={handleMapClick}
      >
        {selectedPosition && (
          <Marker
            position={selectedPosition}
          />
        )}
      </GoogleMapComponent>
    </Box>
  );
};

export default GoogleMap;
