import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack, Button, HStack, Badge } from '@chakra-ui/react';

interface GameMapProps {
  isLoaded: boolean;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  width?: string;
  height?: string;
  showResult?: boolean;
  correctLocation?: { lat: number; lng: number };
  playerLocation?: { lat: number; lng: number } | null;
  isSubmitted?: boolean;
  resultData?: {
    distance: number;
    score: number;
  };
}

const GameMap: React.FC<GameMapProps> = ({
  isLoaded,
  onLocationSelect,
  width = '100%',
  height = '100%',
  showResult = false,
  correctLocation,
  playerLocation,
  isSubmitted = false,
  resultData,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const correctMarkerRef = useRef<google.maps.Marker | null>(null);
  const playerMarkerRef = useRef<google.maps.Marker | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      return;
    }

    console.log('🗺️ GameMap: Initializing map...');

    try {
      const defaultCenter = { lat: 20, lng: 0 };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setIsMapReady(true);
      console.log('✅ GameMap: Map initialized successfully');

    } catch (error) {
      console.error('❌ GameMap: Error initializing map:', error);
    }
  }, [isLoaded]);

  // 결과 표시 로직
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    // 기존 결과 마커들 정리
    if (correctMarkerRef.current) {
      correctMarkerRef.current.setMap(null);
      correctMarkerRef.current = null;
    }
    if (playerMarkerRef.current) {
      playerMarkerRef.current.setMap(null);
      playerMarkerRef.current = null;
    }
    if (lineRef.current) {
      lineRef.current.setMap(null);
      lineRef.current = null;
    }

    if (showResult && correctLocation && playerLocation) {
      console.log('🎯 GameMap: Showing result', { correctLocation, playerLocation });
      
      // 애니메이션과 함께 결과 표시
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        
        // 정답 위치 마커 (파란색, 더 큰 사이즈)
        correctMarkerRef.current = new google.maps.Marker({
          position: correctLocation,
          map: mapInstanceRef.current,
          title: '🎯 정답 위치',
          animation: google.maps.Animation.BOUNCE,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#0066FF',
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 4,
            scale: 18
          },
          zIndex: 1000
        });

        // 플레이어 답안 위치 마커 (초록색)
        playerMarkerRef.current = new google.maps.Marker({
          position: playerLocation,
          map: mapInstanceRef.current,
          title: '📍 내가 선택한 위치',
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#00AA00',
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 4,
            scale: 15
          },
          zIndex: 999
        });

        // 두 지점을 연결하는 선 (점선 스타일)
        lineRef.current = new google.maps.Polyline({
          path: [correctLocation, playerLocation],
          geodesic: true,
          strokeColor: '#FF6B6B',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: mapInstanceRef.current,
          icons: [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 4
            },
            offset: '0',
            repeat: '20px'
          }]
        });

        // 두 마커가 모두 보이도록 지도 범위 조정 (여백 추가)
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(correctLocation);
        bounds.extend(playerLocation);
        
        // 여백을 위해 bounds 확장
        const northeast = bounds.getNorthEast();
        const southwest = bounds.getSouthWest();
        const latDiff = northeast.lat() - southwest.lat();
        const lngDiff = northeast.lng() - southwest.lng();
        const padding = Math.max(latDiff, lngDiff) * 0.3; // 30% 여백
        
        bounds.extend(new google.maps.LatLng(northeast.lat() + padding, northeast.lng() + padding));
        bounds.extend(new google.maps.LatLng(southwest.lat() - padding, southwest.lng() - padding));
        
        mapInstanceRef.current.fitBounds(bounds);
        
        // 너무 확대되지 않도록 최대 줌 레벨 제한
        const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', function() {
          if (mapInstanceRef.current!.getZoom()! > 12) {
            mapInstanceRef.current!.setZoom(12);
          }
          google.maps.event.removeListener(listener);
        });
        
        // 3초 후 애니메이션 중지
        setTimeout(() => {
          if (correctMarkerRef.current) {
            correctMarkerRef.current.setAnimation(null);
          }
          if (playerMarkerRef.current) {
            playerMarkerRef.current.setAnimation(null);
          }
        }, 3000);
        
      }, 300); // 300ms 지연으로 부드러운 전환
    }
  }, [showResult, correctLocation, playerLocation, isMapReady]);

  // 일반 마커 클릭 처리 (결과 표시 중이 아닐 때만)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || showResult) return;

    const clickListener = (event: google.maps.MapMouseEvent) => {
      if (event.latLng && !isSubmitted) {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        console.log('📍 GameMap: Location selected:', clickedLocation);
        setSelectedLocation(clickedLocation);
        
        // 기존 선택 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        
        // 새 선택 마커 추가
        markerRef.current = new google.maps.Marker({
          position: clickedLocation,
          map: mapInstanceRef.current,
          title: '선택된 위치',
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
            scale: 12
          }
        });

        // 애니메이션 제거
        setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.setAnimation(null);
          }
        }, 1000);
      }
    };

    mapInstanceRef.current.addListener('click', clickListener);
    
    return () => {
      if (mapInstanceRef.current) {
        google.maps.event.clearListeners(mapInstanceRef.current, 'click');
      }
    };
  }, [isMapReady, showResult, isSubmitted]);

  const handleSubmitLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleResetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 20, lng: 0 });
      mapInstanceRef.current.setZoom(2);
      
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      
      setSelectedLocation(null);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <Box width={width} height={height} position="relative" borderRadius="lg" overflow="hidden">
      {/* 지도 컨테이너 */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px'
        }} 
      />
      
      {/* 로딩 상태 */}
      {(!isLoaded || !isMapReady) && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          width="100%" 
          height="100%" 
          bg="rgba(255, 255, 255, 0.9)" 
          backdropFilter="blur(4px)"
        >
          <VStack spacing={3}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3182ce',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }} />
            <Text fontSize="md" color="gray.600" fontWeight="medium">
              지도를 로딩하는 중...
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* 상단 컨트롤 */}
      {isLoaded && isMapReady && (
        <Box
          position="absolute"
          top="4"
          left="4"
          zIndex="10"
        >
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
              🎯 지도를 클릭해서 위치를 선택하세요
            </Badge>
            <Button
              size="xs"
              colorScheme="gray"
              variant="solid"
              onClick={handleResetMap}
            >
              지도 초기화
            </Button>
          </HStack>
        </Box>
      )}
      
      {/* 선택된 위치 정보 및 제출 버튼 (결과 표시 중이 아닐 때만) */}
      {selectedLocation && isLoaded && isMapReady && !showResult && !isSubmitted && (
        <Box
          position="absolute"
          bottom="4"
          left="50%"
          transform="translateX(-50%)"
          zIndex="10"
        >
          <VStack spacing={3} align="center">
            <Box
              bg="white"
              px={4}
              py={2}
              borderRadius="lg"
              boxShadow="lg"
              border="2px solid"
              borderColor="blue.200"
            >
              <VStack spacing={1}>
                <Text fontSize="xs" fontWeight="bold" color="blue.600">
                  선택된 위치
                </Text>
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  위도: {selectedLocation.lat.toFixed(6)}
                </Text>
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  경도: {selectedLocation.lng.toFixed(6)}
                </Text>
              </VStack>
            </Box>
            
            <Button
              colorScheme="red"
              size="lg"
              onClick={handleSubmitLocation}
              boxShadow="xl"
              _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
              _active={{ transform: "translateY(0)" }}
              fontWeight="bold"
              px={8}
            >
              🎯 이 위치로 답안 제출!
            </Button>
          </VStack>
        </Box>
      )}

      {/* 결과 표시 시 범례와 다음 문제 버튼 */}
      {showResult && isLoaded && isMapReady && correctLocation && playerLocation && (
        <Box
          position="absolute"
          bottom="4"
          left="50%"
          transform="translateX(-50%)"
          zIndex="10"
        >
          <VStack spacing={3} align="center">
            {/* 범례 */}
            <HStack spacing={4} bg="white" px={4} py={3} borderRadius="lg" boxShadow="lg">
              <HStack spacing={2}>
                <Box w={3} h={3} bg="#0066FF" borderRadius="full" />
                <Text fontSize="xs" fontWeight="bold" color="blue.600">정답 위치</Text>
              </HStack>
              <HStack spacing={2}>
                <Box w={3} h={3} bg="#00AA00" borderRadius="full" />
                <Text fontSize="xs" fontWeight="bold" color="green.600">내 답안</Text>
              </HStack>
              <HStack spacing={2}>
                <Box w={4} h={0.5} bg="#FF6B6B" />
                <Text fontSize="xs" fontWeight="bold" color="red.500">거리</Text>
              </HStack>
            </HStack>
            
            {/* 거리 정보 */}
            {resultData && (
              <Box bg="white" px={4} py={2} borderRadius="lg" boxShadow="md">
                <VStack spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    📏 거리: {resultData.distance.toFixed(2)}km
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="blue.600">
                    🎯 획득 점수: {resultData.score}점
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default GameMap;