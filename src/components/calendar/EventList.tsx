import React from 'react';
import { 
  Box, 
  Text, 
  Spinner, 
  Center, 
  Heading, 
  Button, 
  Flex 
} from '@chakra-ui/react';
import type {EventResponse} from '../../types/calendar';

interface EventListProps {
  selectedDate: Date | null;
  events: EventResponse[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
}

const EventList: React.FC<EventListProps> = ({
  selectedDate,
  events,
  isLoading,
  onOpenCreateModal
}) => {
  // Get events for a specific date
  const getEvents = (date: Date | null): EventResponse[] => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Check if a date has events
  const hasEvents = (date: Date | null): boolean => {
    return getEvents(date).length > 0;
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h4" size="md">Events</Heading>
        <Button 
          colorScheme="blue" 
          size="sm" 
          onClick={onOpenCreateModal}
          isDisabled={!selectedDate}
        >
          Create
        </Button>
      </Flex>
      {isLoading ? (
        <Center p={4}>
          <Spinner />
        </Center>
      ) : !selectedDate ? (
        <Text>Select a date to view events.</Text>
      ) : hasEvents(selectedDate) ? (
        <>
          <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Events:</Text>
          {getEvents(selectedDate).map(event => (
            <Box key={event.id} p={2} bg="gray.50" borderRadius="md" mb={2}>
              <Text fontWeight="bold">{event.title}</Text>
              <Text>{new Date(event.startDateTime).toLocaleTimeString()} - {new Date(event.endDateTime).toLocaleTimeString()}</Text>
              {event.location && <Text fontSize="sm">{event.location}</Text>}
              {event.description && <Text mt={1}>{event.description}</Text>}
            </Box>
          ))}
        </>
      ) : (
        <Text>No events for {selectedDate.toLocaleDateString()}.</Text>
      )}
    </Box>
  );
};

export default EventList;