import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack, Button, HStack, Badge } from '@chakra-ui/react';

interface GameMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  width?: string;
  height?: string;
}

const GameMap: React.FC<GameMapProps> = ({ 
  onLocationSelect,
  width = "100%", 
  height = "400px" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    // Google Maps API 로드 상태 확인
    const checkGoogleMapsAPI = () => {
      if (typeof google !== 'undefined' && google.maps) {
        console.log('✅ Google Maps API is ready for GameMap');
        setIsApiLoaded(true);
        initializeMap();
      } else {
        console.log('⏳ Waiting for Google Maps API...');
        // API 로드를 기다림
        setTimeout(checkGoogleMapsAPI, 500);
      }
    };

    // 즉시 체크
    checkGoogleMapsAPI();
    
    // window 이벤트 리스너도 추가 (fallback)
    const handleGoogleMapsReady = () => {
      console.log('🎯 Google Maps ready event received in GameMap');
      setIsApiLoaded(true);
      initializeMap();
    };
    
    window.addEventListener('google-maps-ready', handleGoogleMapsReady);
    
    return () => {
      window.removeEventListener('google-maps-ready', handleGoogleMapsReady);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !isApiLoaded) return;

    try {
      // 전 세계 보기로 시작 (게임용이므로)
      const defaultCenter = { lat: 20, lng: 0 };
      
      // 지도 생성
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // 게임용 설정 - 깔끔한 UI
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        // 스타일링
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }] // POI 라벨 숨기기
          }
        ]
      });

      // 지도 클릭 이벤트
      mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          
          setSelectedLocation(clickedLocation);
          
          // 기존 마커 제거
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          
          // 새 마커 추가
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

          // 마커에 바운스 애니메이션 추가
          setTimeout(() => {
            if (markerRef.current) {
              markerRef.current.setAnimation(null);
            }
          }, 1000);
        }
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing game map:', error);
      setIsLoading(false);
    }
  };

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
      {isLoading && (
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
            <div className="spinner" style={{
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
      
      {/* API 로드 실패 시 */}
      {!isApiLoaded && !isLoading && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          width="100%" 
          height="100%" 
          bg="gray.100" 
          borderRadius="8px"
        >
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              🗺️ 게임 지도
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Google Maps API를 로딩하는 중입니다...
            </Text>
            <Text fontSize="xs" color="gray.500">
              잠시만 기다려주세요
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* 상단 컨트롤 */}
      {!isLoading && isApiLoaded && (
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
      
      {/* 선택된 위치 정보 및 제출 버튼 */}
      {selectedLocation && !isLoading && (
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