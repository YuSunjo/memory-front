import React, { useEffect, useRef } from 'react';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';

interface ReadOnlyMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
}

const ReadOnlyMap: React.FC<ReadOnlyMapProps> = ({
  lat,
  lng,
  zoom = 15,
  style = { width: '100%', height: '100%' },
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    // 좌표 유효성 검사
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates provided to ReadOnlyMap:', { lat, lng });
      return;
    }

    // 지도 초기화
    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom,
      // 읽기 전용 설정: 사용자 상호작용 최소화
      gestureHandling: 'cooperative', // 스크롤 시 지도 이동 방지
      disableDefaultUI: false, // 기본 UI 유지 (줌 버튼 등)
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      // 스타일링
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'simplified' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // 마커 추가
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: '메모리 위치',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E53E3E"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isLoaded, lat, lng, zoom]);

  // 위치 변경 시 지도 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    
    // 좌표 유효성 검사
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return;
    }

    const newPosition = { lat, lng };
    
    // 지도 중심 이동
    mapInstanceRef.current.setCenter(newPosition);
    
    // 마커 위치 업데이트
    markerRef.current.setPosition(newPosition);
  }, [lat, lng]);

  if (!isLoaded) {
    return (
      <div 
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fafc',
          color: '#718096',
          fontSize: '14px'
        }}
        className={className}
      >
        지도를 불러오는 중...
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={style} 
      className={className}
    />
  );
};

export default ReadOnlyMap;