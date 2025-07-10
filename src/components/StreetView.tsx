import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack } from '@chakra-ui/react';

interface StreetViewProps {
  lat: number;
  lng: number;
  width?: string;
  height?: string;
  isLoaded: boolean;
}

const StreetView: React.FC<StreetViewProps> = ({
  lat,
  lng,
  width = '100%',
  height = '300px',
  isLoaded,
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isLoaded || !streetViewRef.current || !lat || !lng) {
      return;
    }

    console.log('🌍 StreetView: Initializing for:', lat, lng);
    setIsLoading(true);
    setHasError(false);

    const createPanorama = (position: google.maps.LatLng) => {
      panoramaRef.current = new google.maps.StreetViewPanorama(
        streetViewRef.current!,
        {
          position: position,
          pov: {
            heading: Math.random() * 360,
            pitch: 0
          },
          zoom: 1,
          addressControl: false,
          clickToGo: true,
          enableCloseButton: false,
          fullscreenControl: false,
          imageDateControl: false,
          linksControl: true,
          motionTracking: false,
          motionTrackingControl: false,
          panControl: true,
          scrollwheel: true,
          showRoadLabels: false,
          zoomControl: true,
        }
      );
      setIsLoading(false);
      console.log('✅ StreetView: Panorama created successfully');
    };

    try {
      const streetViewService = new google.maps.StreetViewService();
      const position = { lat, lng };

      // 첫 번째 시도: 5km 반경
      streetViewService.getPanorama(
        {
          location: position,
          radius: 5000,
          source: google.maps.StreetViewSource.DEFAULT,
        },
        (data, status) => {
          if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
            console.log('✅ StreetView: Found at 5km radius');
            createPanorama(data.location.latLng);
          } else {
            console.log('🔍 StreetView: Trying wider search (50km)...');
            
            // 두 번째 시도: 50km 반경
            streetViewService.getPanorama(
              {
                location: position,
                radius: 50000,
                source: google.maps.StreetViewSource.DEFAULT,
              },
              (data2, status2) => {
                if (status2 === google.maps.StreetViewStatus.OK && data2?.location?.latLng) {
                  console.log('✅ StreetView: Found at 50km radius');
                  createPanorama(data2.location.latLng);
                } else {
                  console.log('❌ StreetView: No coverage found');
                  setIsLoading(false);
                  setHasError(true);
                }
              }
            );
          }
        }
      );

    } catch (error) {
      console.error('❌ StreetView: Error initializing:', error);
      setIsLoading(false);
      setHasError(true);
    }
  }, [isLoaded, lat, lng]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (panoramaRef.current) {
        panoramaRef.current = null;
      }
    };
  }, []);

  return (
    <Box width={width} height={height} position="relative">
      <div 
        ref={streetViewRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
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
          bg="gray.100" 
          borderRadius="8px"
        >
          <VStack spacing={2}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #38a169',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite'
            }} />
            <Text fontSize="sm" color="gray.600">
              거리뷰를 로딩 중...
            </Text>
            <Text fontSize="xs" color="gray.500">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* 에러 상태 */}
      {hasError && !isLoading && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          width="100%" 
          height="100%" 
          bg="red.50" 
          borderRadius="8px"
        >
          <VStack spacing={2}>
            <Text fontSize="md" color="red.600" fontWeight="bold">
              ❌ 거리뷰 사용 불가
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              이 위치에는 거리뷰가 없습니다
            </Text>
            <Text fontSize="xs" color="gray.500">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </Text>
            <Text fontSize="xs" color="red.500" textAlign="center">
              50km 반경 내에서 거리뷰를 찾을 수 없습니다
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* API 로드 대기 상태 */}
      {!isLoaded && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          width="100%" 
          height="100%" 
          bg="blue.100" 
          borderRadius="8px"
        >
          <VStack spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              🌍 거리뷰 준비 중
            </Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Google Maps API 로딩 중...
            </Text>
          </VStack>
        </Center>
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

export default StreetView;