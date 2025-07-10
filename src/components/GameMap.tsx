import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack, Button, HStack, Badge } from '@chakra-ui/react';

interface GameMapProps {
  isLoaded: boolean;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  width?: string;
  height?: string;
}

const GameMap: React.FC<GameMapProps> = ({
                                           isLoaded,
                                           onLocationSelect,
                                           width = '100%',
                                           height = '100%',
                                         }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!mapRef.current) return;

    const defaultCenter = { lat: 20, lng: 0 };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      streetViewControl: false,
    });

    mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const clicked = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setSelectedLocation(clicked);

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new google.maps.Marker({
          position: clicked,
          map: mapInstanceRef.current!,
          animation: google.maps.Animation.DROP,
        });
      }
    });

    setIsLoading(false);

    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [isLoaded]);

  const handleSubmitLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
      <Box width={width} height={height} position="relative">
        {/* 지도 */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* 상단 컨트롤 */}
        {!isLoading && (
            <Box position="absolute" top="4" left="4" zIndex="10">
              <HStack>
                <Badge colorScheme="blue">🎯 지도를 클릭해 위치 선택</Badge>
                <Button size="xs" onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter({ lat: 20, lng: 0 });
                    mapInstanceRef.current.setZoom(2);
                  }
                  if (markerRef.current) markerRef.current.setMap(null);
                  setSelectedLocation(null);
                }}>초기화</Button>
              </HStack>
            </Box>
        )}

        {/* 선택된 좌표 + 제출 버튼 */}
        {!isLoading && (
            <Box
                position="absolute"
                bottom="4"
                left="50%"
                transform="translateX(-50%)"
                zIndex="10"
            >
              <VStack>
                {selectedLocation && (
                    <Box bg="white" px={4} py={2} borderRadius="md" boxShadow="md">
                      <Text fontSize="xs">위도: {selectedLocation.lat.toFixed(6)}</Text>
                      <Text fontSize="xs">경도: {selectedLocation.lng.toFixed(6)}</Text>
                    </Box>
                )}
                <Button
                    size="lg"
                    colorScheme="red"
                    onClick={handleSubmitLocation}
                    isDisabled={!selectedLocation}
                >
                  {selectedLocation ? '🎯 이 위치로 답안 제출!' : '먼저 지도를 클릭하세요'}
                </Button>
              </VStack>
            </Box>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
            <Center position="absolute" top="0" left="0" width="100%" height="100%">
              <Text>지도를 로딩 중...</Text>
            </Center>
        )}
      </Box>
  );
};

export default GameMap;