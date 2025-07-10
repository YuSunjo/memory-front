import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Center, VStack } from '@chakra-ui/react';

interface StreetViewProps {
    lat: number;
    lng: number;
    width?: string;
    height?: string;
    isLoaded: boolean; // ✅ react-google-maps-api에서 받은 isLoaded
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
        if (!isLoaded) return; // ✅ API가 아직 안 로드됐으면 초기화 안함
        if (!streetViewRef.current || !lat || !lng) return;

        console.log('🌍 Initializing Street View for:', lat, lng);

        setIsLoading(true);
        setHasError(false);

        try {
            const streetViewService = new google.maps.StreetViewService();
            const position = { lat, lng };

            streetViewService.getPanorama(
                {
                    location: position,
                    radius: 50,
                    source: google.maps.StreetViewSource.DEFAULT,
                },
                (data, status) => {
                    setIsLoading(false);
                    if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                        panoramaRef.current = new google.maps.StreetViewPanorama(
                            streetViewRef.current!,
                            {
                                position: data.location.latLng,
                                pov: {
                                    heading: Math.random() * 360, // 랜덤 방향
                                    pitch: 0,
                                },
                                zoom: 1,
                                addressControl: false,
                                clickToGo: true,
                                fullscreenControl: false,
                                imageDateControl: false,
                                linksControl: true,
                                motionTracking: false,
                                panControl: true,
                                scrollwheel: true,
                                showRoadLabels: false,
                                zoomControl: true,
                            }
                        );
                        console.log('✅ Street View loaded successfully!');
                    } else {
                        console.warn('❌ Street View not available for this location:', lat, lng);
                        setHasError(true);
                    }
                }
            );
        } catch (error) {
            console.error('Error initializing Street View:', error);
            setIsLoading(false);
            setHasError(true);
        }

        return () => {
            if (panoramaRef.current) {
                panoramaRef.current = null;
            }
        };
    }, [lat, lng, isLoaded]);

    return (
        <Box width={width} height={height} position="relative">
            <div
                ref={streetViewRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
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
                        <Text fontSize="xs" color="gray.600">
                            이 위치에는 거리뷰가 없습니다.
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {lat.toFixed(6)}, {lng.toFixed(6)}
                        </Text>
                    </VStack>
                </Center>
            )}

            {/* Google Maps API가 아직 안 로드된 경우 fallback */}
            {!isLoaded && !isLoading && !hasError && (
                <Center
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    bg="blue.100"
                    borderRadius="8px"
                >
                    <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                            Google Maps API 로딩 대기중...
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            위도: {lat.toFixed(6)} | 경도: {lng.toFixed(6)}
                        </Text>
                    </VStack>
                </Center>
            )}
        </Box>
    );
};

export default StreetView;