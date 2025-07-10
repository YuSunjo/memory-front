import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack } from '@chakra-ui/react';

interface StreetViewProps {
  lat: number;
  lng: number;
  width?: string;
  height?: string;
}

const StreetView: React.FC<StreetViewProps> = ({ 
  lat, 
  lng, 
  width = "100%", 
  height = "300px" 
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!streetViewRef.current || !lat || !lng) return;

    const initStreetView = () => {
      // Google Maps API가 로드되었는지 확인
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('🔄 Google Maps API is not loaded yet for StreetView, waiting...');
        return;
      }

      console.log('🌍 Initializing Street View for:', lat, lng);

      try {
        // Street View 서비스 생성
        const streetViewService = new google.maps.StreetViewService();
        
        const position = { lat, lng };
        
        // 해당 위치 근처에 Street View가 있는지 확인
        streetViewService.getPanorama(
          {
            location: position,
            radius: 50, // 50미터 반경 내에서 찾기
            source: google.maps.StreetViewSource.DEFAULT
          },
          (data, status) => {
            setIsLoading(false);
            if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
              // Street View가 있는 경우 panorama 생성
              panoramaRef.current = new google.maps.StreetViewPanorama(
                streetViewRef.current!,
                {
                  position: data.location.latLng,
                  pov: {
                    heading: Math.random() * 360, // 랜덤 방향
                    pitch: 0
                  },
                  zoom: 1,
                  // UI 컨트롤 숨기기 (게임이므로)
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
              console.log('✅ Street View loaded successfully');
            } else {
              console.warn('Street View not available for this location:', lat, lng, 'Status:', status);
              setHasError(true);
            }
          }
        );
      } catch (error) {
        console.error('Error initializing Street View:', error);
        setIsLoading(false);
        setHasError(true);
      }
    };

    // Google Maps API가 이미 로드되었는지 확인
    if (typeof google !== 'undefined' && google.maps) {
      initStreetView();
    } else {
      // API 로드를 기다리기
      const checkAPI = () => {
        if (typeof google !== 'undefined' && google.maps) {
          initStreetView();
        } else {
          setTimeout(checkAPI, 500);
        }
      };
      
      checkAPI();
      
      // 이벤트 리스너도 추가
      const handleGoogleMapsReady = () => {
        console.log('🌍 StreetView: Google Maps ready event received');
        initStreetView();
      };
      
      window.addEventListener('google-maps-ready', handleGoogleMapsReady);
      
      // 정리 함수
      return () => {
        window.removeEventListener('google-maps-ready', handleGoogleMapsReady);
        if (panoramaRef.current) {
          panoramaRef.current = null;
        }
      };
    }

    // cleanup function
    return () => {
      if (panoramaRef.current) {
        panoramaRef.current = null;
      }
    };
  }, [lat, lng]);

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
            <Text fontSize="md" color="gray.600">
              거리뷰를 로딩 중...
            </Text>
            <Text fontSize="xs" color="gray.500">
              위도: {lat.toFixed(6)} | 경도: {lng.toFixed(6)}
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* 에러 상태 */}
      {hasError && (
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
              거리뷰 사용 불가
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              이 위치에는 거리뷰가 없습니다
            </Text>
            <Text fontSize="xs" color="gray.500">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </Text>
          </VStack>
        </Center>
      )}
      
      {/* Google Maps API가 없는 경우 fallback */}
      {(typeof google === 'undefined' || !google?.maps) && !isLoading && !hasError && (
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
              🌍 거리뷰 위치
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              위도: {lat.toFixed(6)}
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              경도: {lng.toFixed(6)}
            </Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Google Maps API 로드 중...
            </Text>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default StreetView;