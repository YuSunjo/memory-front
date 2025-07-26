import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Badge,
  Alert,
  AlertIcon,
  useBreakpointValue
} from '@chakra-ui/react';
import { useCalendarService } from '../services/calendarService';
import type { DdayEventResponse } from '../types/calendar';
import { GlassCard, HeroSection, ListItemSkeleton } from './design-system';
import { designTokens } from '../theme/tokens';

const ResponsiveUpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<DdayEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchDdayEvents } = useCalendarService();

  // Responsive configurations
  const cardPadding = useBreakpointValue({ 
    base: designTokens.spacing.sm, 
    md: designTokens.spacing.md, 
    lg: designTokens.spacing.lg 
  });

  const eventItemPadding = useBreakpointValue({ 
    base: 3, 
    md: 4 
  });

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ddayEvents = await fetchDdayEvents();
      setEvents(ddayEvents);
    } catch (err) {
      setError('일정을 불러올 수 없습니다');
      console.error('Error loading dday events:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchDdayEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const formatDday = (daysUntil: number | undefined | null): { text: string; color: string } => {
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
    if (!dateTime) {
      return '날짜 정보 없음';
    }
    
    const date = new Date(dateTime);
    
    if (isNaN(date.getTime())) {
      return '잘못된 날짜 형식';
    }
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <GlassCard 
      variant="light"
      enableBlur={false}
      p={cardPadding}
      height="100%"
      minHeight={{ base: '200px', md: '250px' }}
    >
      <HeroSection
        title="📅 다가오는 일정"
        variant="minimal"
        textAlign="left"
        mb={4}
      />

      {loading ? (
        <ListItemSkeleton count={3} speed={1.2} />
      ) : error ? (
        <Alert status="error" borderRadius="lg" fontSize="sm">
          <AlertIcon />
          {error}
        </Alert>
      ) : events.length === 0 ? (
        <VStack spacing={2} align="center" py={6}>
          <Text 
            color="gray.500" 
            fontSize="sm"
            textAlign="center"
          >
            예정된 일정이 없습니다
          </Text>
          <Text 
            color="gray.400" 
            fontSize="xs"
            textAlign="center"
          >
            새로운 D-day 이벤트를 추가해보세요!
          </Text>
        </VStack>
      ) : (
        <VStack 
          spacing={3} 
          align="stretch"
          maxHeight="300px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: designTokens.colors.brand.primary,
              borderRadius: '4px',
            },
          }}
        >
          {events.map((event) => {
            const ddayInfo = formatDday(event.dday);
            return (
              <Box
                key={event.id}
                p={eventItemPadding}
                bg={designTokens.colors.glass.backgroundLight}
                borderRadius="xl" 
                boxShadow={designTokens.shadows.sm}
                border="1px solid"
                borderColor={designTokens.colors.glass.border}
                _hover={{ 
                  bg: designTokens.colors.glass.background,
                  transform: "translateY(-2px)",
                  boxShadow: designTokens.shadows.md
                }}
                transition={`all ${designTokens.animation.normal} ${designTokens.animation.easing.ease}`}
              >
                <HStack justify="space-between" align="start" spacing={3}>
                  <VStack align="start" spacing={1} flex={1} minWidth={0}>
                    <Text 
                      fontWeight="semibold" 
                      fontSize={{ base: 'sm', md: 'md' }}
                      color="gray.700"
                      lineHeight="shorter"
                      noOfLines={1}
                    >
                      {event.title}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color="gray.600"
                      noOfLines={1}
                    >
                      {formatDateTime(event.startDateTime)}
                    </Text>
                    {event.location && (
                      <Text 
                        fontSize="xs" 
                        color="gray.500"
                        noOfLines={1}
                      >
                        📍 {event.location}
                      </Text>
                    )}
                  </VStack>
                  <Badge
                    bg={ddayInfo.color === 'red' ? 'red.500' : 
                        ddayInfo.color === 'blue' ? 'brand.500' : 
                        'gray.500'}
                    color="white"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                    boxShadow={designTokens.shadows.sm}
                    flexShrink={0}
                  >
                    {ddayInfo.text}
                  </Badge>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </GlassCard>
  );
};

export default ResponsiveUpcomingEvents;