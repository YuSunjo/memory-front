import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Input, Button, Flex, useToast } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { GoogleMap as GoogleMapComponent, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
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

const GoogleMap: React.FC<GoogleMapProps> = ({ onLocationSelect, onMapSelect, maps = [] }) => {
  console.log('🗺 GoogleMap component rendered');
  console.log('🗺 Received maps prop:', maps);
  console.log('🗺 Number of maps to display:', maps.length);
  
  const { isLoaded, loadError } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [selectedMapMarker, setSelectedMapMarker] = useState<MapData | null>(null);
  const [currentCenter, setCurrentCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<google.maps.places.PlaceResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Initialize geocoder and places service when map is loaded
  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new google.maps.Geocoder());
    }
    if (isLoaded && map && !placesService) {
      // Places Service 안전 체크
      try {
        if (google.maps.places && google.maps.places.PlacesService) {
          setPlacesService(new google.maps.places.PlacesService(map));
        } else {
          console.warn('Places API is not loaded. Search functionality will be disabled.');
        }
      } catch (error) {
        console.error('Error initializing Places Service:', error);
      }
    }
  }, [isLoaded, geocoder, map, placesService]);

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

  // Search for places
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      toast({
        title: '검색어를 입력해주세요',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!map || !placesService) {
      toast({
        title: '지도 검색 기능이 준비되지 않았습니다',
        description: 'Google Maps API를 로딩하는 중입니다. 잠시 후 다시 시도해주세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const request: google.maps.places.TextSearchRequest = {
      query: searchQuery,
      location: map.getCenter() || currentCenter,
      radius: 50000, // 50km radius
    };

    placesService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const filteredResults = results.slice(0, 10);
        
        setSearchResults(filteredResults);
        
        // Focus on first result
        if (filteredResults[0]?.geometry?.location) {
          const firstResult = {
            lat: filteredResults[0].geometry.location.lat(),
            lng: filteredResults[0].geometry.location.lng()
          };
          map.setCenter(firstResult);
          map.setZoom(15);
        }
        
        toast({
          title: `${filteredResults.length}개의 검색 결과를 찾았습니다`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '검색 결과가 없습니다',
          description: '다른 키워드로 검색해보세요',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    });
  }, [searchQuery, map, placesService, currentCenter, toast]);

  // Go to current location
  const goToCurrentLocation = useCallback(() => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentCenter(newCenter);
          map.setCenter(newCenter);
          map.setZoom(16);
          
          toast({
            title: '현재 위치로 이동했습니다',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          toast({
            title: '위치를 가져올 수 없습니다',
            description: '위치 권한을 확인해주세요',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [map, toast]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSelectedSearchResult(null);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, []);

  // Handle Enter key press in search input
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

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
      position="relative"
    >
      {/* Search Bar */}
      <Box
        position="absolute"
        top="4"
        left="4"
        right="4"
        zIndex="10"
        bg="white"
        borderRadius="md"
        boxShadow="lg"
        p="3"
      >
        <Flex gap="2">
          <Input
            ref={searchInputRef}
            placeholder="장소, 주소, 업체명을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            size="sm"
            bg="gray.50"
          />
          <Button
            leftIcon={<SearchIcon />}
            onClick={handleSearch}
            colorScheme="blue"
            size="sm"
            minW="80px"
          >
            검색
          </Button>
          <Button
            onClick={goToCurrentLocation}
            colorScheme="green"
            size="sm"
            minW="80px"
          >
            현재 위치
          </Button>
          <Button
            onClick={clearSearch}
            colorScheme="gray"
            size="sm"
            variant="outline"
          >
            초기화
          </Button>
        </Flex>
      </Box>

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

        {/* Display search result markers */}
        {searchResults.map((place, index) => (
          <Marker
            key={`search-${index}`}
            position={{
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }}
            onClick={() => setSelectedSearchResult(place)}
            icon={{
              url: place.icon || 'https://maps.google.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png',
              scaledSize: new google.maps.Size(30, 30)
            }}
            title={place.name}
          />
        ))}

        {/* Display markers for each map */}
        {(() => {
          console.log('📍 Rendering saved map markers:', maps.length);
          return maps.map((mapData, index) => {
            console.log(`📍 Rendering marker ${index + 1}:`, {
              id: mapData.id,
              name: mapData.name,
              lat: parseFloat(mapData.latitude),
              lng: parseFloat(mapData.longitude)
            });
            
            return (
              <Marker
                key={mapData.id}
                position={{
                  lat: parseFloat(mapData.latitude),
                  lng: parseFloat(mapData.longitude)
                }}
                onClick={() => {
                  console.log('📍 Saved map marker clicked:', mapData);
                  setSelectedMapMarker(mapData);
                  if (onMapSelect) {
                    onMapSelect(mapData);
                  }
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#34A853', // Green color
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                  scale: 10
                }}
                title={mapData.name}
              />
            );
          });
        })()}

        {/* Display info window for selected search result */}
        {selectedSearchResult && selectedSearchResult.geometry?.location && (
          <InfoWindow
            position={{
              lat: selectedSearchResult.geometry.location.lat(),
              lng: selectedSearchResult.geometry.location.lng()
            }}
            onCloseClick={() => setSelectedSearchResult(null)}
          >
            <div style={{ padding: '8px', maxWidth: '280px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f1f1f' }}>
                {selectedSearchResult.name}
              </h3>
              
              {selectedSearchResult.formatted_address && (
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                  📍 {selectedSearchResult.formatted_address}
                </p>
              )}
              
              {selectedSearchResult.rating && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#fbbc04', marginRight: '4px' }}>⭐</span>
                  <span style={{ fontSize: '13px', color: '#1f1f1f', fontWeight: '500' }}>
                    {selectedSearchResult.rating}
                  </span>
                  {selectedSearchResult.user_ratings_total && (
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
                      ({selectedSearchResult.user_ratings_total}개 리뷰)
                    </span>
                  )}
                </div>
              )}
              
              {selectedSearchResult.price_level && (
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#666' }}>
                  💰 가격대: {'$'.repeat(selectedSearchResult.price_level)}
                </p>
              )}
              
              {/* Fixed: Remove deprecated opening_hours.open_now */}
              {selectedSearchResult.opening_hours && (
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '12px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  🕒 영업시간 정보 있음
                </p>
              )}
              
              {selectedSearchResult.types && selectedSearchResult.types.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {selectedSearchResult.types
                      .filter(type => !type.includes('establishment') && !type.includes('point_of_interest'))
                      .slice(0, 3)
                      .map(type => type.replace(/_/g, ' '))
                      .join(' • ')}
                  </div>
                </div>
              )}

              {/* Add to map button */}
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={() => {
                    if (selectedSearchResult.geometry?.location && onLocationSelect) {
                      onLocationSelect({
                        latitude: selectedSearchResult.geometry.location.lat(),
                        longitude: selectedSearchResult.geometry.location.lng(),
                        address: selectedSearchResult.formatted_address || selectedSearchResult.name || ''
                      });
                      toast({
                        title: '장소가 선택되었습니다',
                        description: '오른쪽 패널에서 지도를 저장할 수 있습니다',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  이 장소 선택하기
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

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
