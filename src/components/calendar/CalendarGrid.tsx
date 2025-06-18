import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Flex, 
  IconButton, 
  Heading, 
  Text, 
  VStack 
} from '@chakra-ui/react';
import type {TodoResponse, DiaryResponse, EventResponse} from '../../types/calendar';

interface CalendarGridProps {
  currentDate: Date;
  calendarDays: Array<{ date: Date, isCurrentMonth: boolean }>;
  selectedDate: Date | null;
  todos: TodoResponse[];
  diaries: DiaryResponse[];
  events: EventResponse[];
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onPreviousYear: () => void;
  onNextYear: () => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  calendarDays,
  selectedDate,
  todos,
  diaries,
  events,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onPreviousYear,
  onNextYear
}) => {
  // Get month name and year
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Day of week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a date has todo items
  const hasTodoItems = (date: Date | null): boolean => {
    if (!date) return false;
    return todos.some(todo => {
      const todoDate = new Date(todo.dueDate);
      return todoDate.getDate() === date.getDate() && 
             todoDate.getMonth() === date.getMonth() && 
             todoDate.getFullYear() === date.getFullYear();
    });
  };

  // Get todo items for a specific date
  const getTodoItems = (date: Date | null): TodoResponse[] => {
    if (!date) return [];
    return todos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return todoDate.getDate() === date.getDate() && 
             todoDate.getMonth() === date.getMonth() && 
             todoDate.getFullYear() === date.getFullYear();
    });
  };

  // Get remaining (uncompleted) todo count for a specific date
  const getRemainingTodoCount = (date: Date | null): number => {
    const items = getTodoItems(date);
    return items.filter(item => !item.completed).length;
  };

  // Check if a date has diary entries
  const hasDiaryEntries = (date: Date | null): boolean => {
    if (!date) return false;
    return diaries.some(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getDate() === date.getDate() && 
             diaryDate.getMonth() === date.getMonth() && 
             diaryDate.getFullYear() === date.getFullYear();
    });
  };

  // Get diary entries for a specific date
  const getDiaryEntries = (date: Date | null): DiaryResponse[] => {
    if (!date) return [];
    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getDate() === date.getDate() && 
             diaryDate.getMonth() === date.getMonth() && 
             diaryDate.getFullYear() === date.getFullYear();
    });
  };

  // Check if a date has events
  const hasEvents = (date: Date | null): boolean => {
    if (!date) return false;
    return events.some(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

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

  return (
    <Box p={6} bg="white" boxShadow="md" borderRadius="md">
      {/* Calendar header with month/year and navigation */}
      <VStack spacing={2} mb={4}>
        {/* Year navigation */}
        <Flex justify="space-between" align="center" width="100%">
          <IconButton
            aria-label="Previous year"
            icon={<Text>«</Text>}
            onClick={onPreviousYear}
            variant="ghost"
          />
          <Heading as="h2" size="lg">{year}</Heading>
          <IconButton
            aria-label="Next year"
            icon={<Text>»</Text>}
            onClick={onNextYear}
            variant="ghost"
          />
        </Flex>

        {/* Month navigation */}
        <Flex justify="space-between" align="center" width="100%">
          <IconButton
            aria-label="Previous month"
            icon={<Text>←</Text>}
            onClick={onPreviousMonth}
            variant="ghost"
          />
          <Heading as="h3" size="md">{monthName}</Heading>
          <IconButton
            aria-label="Next month"
            icon={<Text>→</Text>}
            onClick={onNextMonth}
            variant="ghost"
          />
        </Flex>
      </VStack>

      {/* Calendar grid */}
      <Box>
        {/* Weekday headers */}
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
          {weekDays.map((day, index) => (
            <GridItem key={index} textAlign="center">
              <Text fontWeight="bold" color="gray.600">{day}</Text>
            </GridItem>
          ))}
        </Grid>

        {/* Calendar days */}
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {calendarDays.map((day, index) => (
            <GridItem 
              key={index} 
              bg={
                selectedDate && day.date && 
                selectedDate.getDate() === day.date.getDate() && 
                selectedDate.getMonth() === day.date.getMonth() && 
                selectedDate.getFullYear() === day.date.getFullYear()
                  ? "blue.100"
                  : day.isCurrentMonth ? "white" : "gray.50"
              }
              border="1px solid"
              borderColor={
                selectedDate && day.date && 
                selectedDate.getDate() === day.date.getDate() && 
                selectedDate.getMonth() === day.date.getMonth() && 
                selectedDate.getFullYear() === day.date.getFullYear()
                  ? "blue.400"
                  : "gray.200"
              }
              borderRadius="md"
              p={2}
              height="100px"
              _hover={{ 
                bg: day.isCurrentMonth ? "blue.50" : "gray.100",
                cursor: "pointer"
              }}
              onClick={() => day.date && onDateSelect(day.date)}
            >
              <VStack spacing={1} align="stretch">
                <Text 
                  color={day.isCurrentMonth ? "black" : "gray.400"}
                  fontWeight={
                    day.date && 
                    day.date.getDate() === new Date().getDate() && 
                    day.date.getMonth() === new Date().getMonth() && 
                    day.date.getFullYear() === new Date().getFullYear() 
                      ? "bold" 
                      : "normal"
                  }
                >
                  {day.date?.getDate()}
                </Text>
                {day.date && (
                  <VStack spacing={1} align="stretch" mt={1}>
                    {hasTodoItems(day.date) && (
                      <Text fontSize="xs" color="red.500">
                        Todo: {getRemainingTodoCount(day.date)}({getTodoItems(day.date).length})
                      </Text>
                    )}
                    {hasEvents(day.date) && (
                      <Text fontSize="xs" color="blue.500">
                        Event: {getEvents(day.date).length}
                      </Text>
                    )}
                    {hasDiaryEntries(day.date) && (
                      <Text fontSize="xs" color="green.500">
                        Diary: {getDiaryEntries(day.date).length}
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CalendarGrid;