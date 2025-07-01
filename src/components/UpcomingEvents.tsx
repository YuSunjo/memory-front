import React, { useEffect, useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Heading, 
  Text, 
  Badge,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useCalendarService } from '../services/calendarService';
import type { DdayEventResponse } from '../types/calendar';

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<DdayEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchDdayEvents } = useCalendarService();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const ddayEvents = await fetchDdayEvents();
        console.log('📅 Fetched dday events:', ddayEvents); // 디버깅용
        setEvents(ddayEvents);
      } catch (err) {
        setError('Failed to load upcoming events');
        console.error('Error loading dday events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDday = (daysUntil: number | undefined | null): { text: string; color: string } => {
    // 안전한 dday 처리
    if (daysUntil === undefined || daysUntil === null || isNaN(daysUntil)) {
      return { text: 'D-?', color: 'gray' };
    }
    
    if (daysUntil === 0) {
      return { text: 'D-DAY', color: 'red' };
    } else if (daysUntil > 0) {
      return { text: `D-${daysUntil}`, color: 'blue' };
    } else {
      return { text: `D+${Math.abs(daysUntil)}`, color: 'gray' };
    }
  };

  const formatDateTime = (dateTime: string | undefined | null): string => {
    // 안전한 날짜 처리
    if (!dateTime) {
      return '날짜 정보 없음';
    }
    
    const date = new Date(dateTime);
    
    // Invalid Date 처리
    if (isNaN(date.getTime())) {
      console.warn('🚨 Invalid date format:', dateTime);
      return '잘못된 날짜 형식';
    }
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box height="50%" p={4} borderBottom="1px" borderColor="gray.200">
        <VStack spacing={4} align="start">
          <Heading as="h2" size="lg" color="gray.700">Upcoming events</Heading>
          <HStack>
            <Spinner size="sm" />
            <Text fontSize="md" color="gray.600">Loading events...</Text>
          </HStack>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="50%" p={4} borderBottom="1px" borderColor="gray.200">
        <VStack spacing={4} align="start">
          <Heading as="h2" size="lg" color="gray.700">Upcoming events</Heading>
          <Alert status="error" size="sm">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        </VStack>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box height="50%" p={4} borderBottom="1px" borderColor="gray.200">
        <VStack spacing={4} align="start">
          <Heading as="h2" size="lg" color="gray.700">Upcoming events</Heading>
          <VStack spacing={2} align="start">
            <Text fontSize="md" color="gray.600">📅 다가오는 이벤트가 없습니다</Text>
            <Text fontSize="sm" color="gray.500">새로운 D-day 이벤트를 추가해보세요!</Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box height="50%" p={4} borderBottom="1px" borderColor="gray.200" overflowY="auto">
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg" color="gray.700">Upcoming events</Heading>
        {events.map((event) => {
          console.log('🔍 Event data:', event); // 디버깅용
          const dday = formatDday(event.dday);
          return (
            <Box
              key={event.id}
              p={3}
              borderRadius="md"
              border="1px"
              borderColor="gray.200"
              bg="white"
              _hover={{ bg: 'gray.50' }}
            >
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                    {event.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    {formatDateTime(event.startDateTime)}
                  </Text>
                  {event.location && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      📍 {event.location}
                    </Text>
                  )}
                </VStack>
                <Badge
                  colorScheme={dday.color}
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={1}
                >
                  {dday.text}
                </Badge>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default UpcomingEvents;