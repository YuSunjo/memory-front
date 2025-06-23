import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type {LocationData, MapData} from '../types';

interface GoogleMapProps {
  apiKey: string;
  onLocationSelect?: (location: LocationData) => void;
  onMapSelect?: (map: MapData) => void;
  maps?: MapData[];
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px'
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780 // Default to Seoul, Korea
};

const GoogleMap: React.FC<GoogleMapProps> = ({ apiKey, onLocationSelect, onMapSelect, maps = [] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  console.log(map);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [selectedMapMarker, setSelectedMapMarker] = useState<MapData | null>(null);
  const [currentCenter, setCurrentCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);

  // Initialize geocoder when map is loaded
  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success: update center to user's location
          setCurrentCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

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
        center={currentCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* Display marker for current location */}
        <Marker
          position={currentCenter}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8
          }}
          title="Your current location"
        />

        {/* Display marker for selected position */}
        {selectedPosition && (
          <Marker
            position={selectedPosition}
          />
        )}

        {/* Display markers for each map */}
        {maps.map((mapData) => (
          <Marker
            key={mapData.id}
            position={{
              lat: parseFloat(mapData.latitude),
              lng: parseFloat(mapData.longitude)
            }}
            onClick={() => {
              setSelectedMapMarker(mapData);
              if (onMapSelect) {
                onMapSelect(mapData);
              }
            }}
          />
        ))}

        {/* Display info window for selected map marker */}
        {selectedMapMarker && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedMapMarker.latitude),
              lng: parseFloat(selectedMapMarker.longitude)
            }}
            onCloseClick={() => setSelectedMapMarker(null)}
          >
            <div>
              <h3>{selectedMapMarker.name}</h3>
              <p>{selectedMapMarker.description}</p>
              <p>{selectedMapMarker.address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMapComponent>
    </Box>
  );
};

export default GoogleMap;
