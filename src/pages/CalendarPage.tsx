import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  VStack, 
  Grid, 
  GridItem, 
  Flex, 
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useCalendarService } from '../services/calendarService';
import type {TodoResponse, DiaryResponse, EventResponse} from '../types/calendar';

const CalendarPage: React.FC = () => {
  const calendarService = useCalendarService();

  // Date state
  const [currentDate, setCurrentDate] = useState(new Date()); // Initialize to current date
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date | null, isCurrentMonth: boolean }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data state
  const [todos, setTodos] = useState<TodoResponse[]>([]);
  const [diaries, setDiaries] = useState<DiaryResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState({
    todos: false,
    diaries: false,
    events: false
  });

  const toggleTodoChecked = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Format date to YYYY-MM-DD for API requests
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Fetch todos for a date range
  const fetchTodos = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(prev => ({ ...prev, todos: true }));
    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const data = await calendarService.fetchTodos(formattedStartDate, formattedEndDate);
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, todos: false }));
    }
  }, [calendarService, formatDate]);

  // Fetch diaries for a date range
  const fetchDiaries = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(prev => ({ ...prev, diaries: true }));
    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const data = await calendarService.fetchDiaries(formattedStartDate, formattedEndDate);
      setDiaries(data);
    } catch (error) {
      console.error('Error fetching diaries:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, diaries: false }));
    }
  }, [calendarService, formatDate]);

  // Fetch events for a date range
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(prev => ({ ...prev, events: true }));
    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const data = await calendarService.fetchEvents(formattedStartDate, formattedEndDate);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, events: false }));
    }
  }, [calendarService, formatDate]);

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

  // Get month name and year
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to previous year
  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };

  // Navigate to next year
  const goToNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  // Generate calendar days and fetch data for the visible month
  useEffect(() => {
    const days: Array<{ date: Date, isCurrentMonth: boolean }> = [];

    // Get first day of the month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Get the last day of the month
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get the number of days in the month
    const daysInMonth = lastDayOfMonth.getDate();

    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();

    // Add days from previous month to fill the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = daysInPrevMonth - firstDayOfWeek + i + 1;
      days.push({ 
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDay),
        isCurrentMonth: false 
      });
    }

    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true 
      });
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false 
      });
    }

    setCalendarDays(days);

    // Fetch data for the visible month
    // We need to fetch data for the entire range of days shown in the calendar
    if (days.length > 0 && days[0].date && days[days.length - 1].date) {
      const startDate = days[0].date;
      const endDate: Date = days[days.length - 1].date;

      fetchTodos(startDate, endDate);
      fetchDiaries(startDate, endDate);
      fetchEvents(startDate, endDate);
    }
  }, [currentDate]);

  // Day of week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Calendar</Heading>

        <Box p={6} bg="white" boxShadow="md" borderRadius="md">
          {/* Calendar header with month/year and navigation */}
          <VStack spacing={2} mb={4}>
            {/* Year navigation */}
            <Flex justify="space-between" align="center" width="100%">
              <IconButton
                aria-label="Previous year"
                icon={<Text>«</Text>}
                onClick={goToPreviousYear}
                variant="ghost"
              />
              <Heading as="h2" size="lg">{year}</Heading>
              <IconButton
                aria-label="Next year"
                icon={<Text>»</Text>}
                onClick={goToNextYear}
                variant="ghost"
              />
            </Flex>

            {/* Month navigation */}
            <Flex justify="space-between" align="center" width="100%">
              <IconButton
                aria-label="Previous month"
                icon={<Text>←</Text>}
                onClick={goToPreviousMonth}
                variant="ghost"
              />
              <Heading as="h3" size="md">{monthName}</Heading>
              <IconButton
                aria-label="Next month"
                icon={<Text>→</Text>}
                onClick={goToNextMonth}
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
                  onClick={() => day.date && setSelectedDate(day.date)}
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

          {/* Tabs below calendar */}
          <Box mt={6}>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>Todo</Tab>
                <Tab>Diary</Tab>
                <Tab>Event</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box p={4}>
                    <Heading as="h4" size="md" mb={4}>Todo List</Heading>
                    {isLoading.todos ? (
                      <Center p={4}>
                        <Spinner />
                      </Center>
                    ) : !selectedDate ? (
                      <Text>Select a date to view todo items.</Text>
                    ) : hasTodoItems(selectedDate) ? (
                      <>
                        <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Todo Items:</Text>
                        {getTodoItems(selectedDate).map(todo => (
                          <Box key={todo.id} p={2} bg="gray.50" borderRadius="md" mb={2}>
                            <Checkbox 
                              isChecked={todo.completed} 
                              onChange={() => toggleTodoChecked(todo.id)}
                              colorScheme="blue"
                            >
                              <Text noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                                {todo.title}
                              </Text>
                            </Checkbox>
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Text>No todo items for {selectedDate.toLocaleDateString()}.</Text>
                    )}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box p={4}>
                    <Heading as="h4" size="md" mb={4}>Diary Entries</Heading>
                    {isLoading.diaries ? (
                      <Center p={4}>
                        <Spinner />
                      </Center>
                    ) : !selectedDate ? (
                      <Text>Select a date to view diary entries.</Text>
                    ) : hasDiaryEntries(selectedDate) ? (
                      <>
                        <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Diary Entries:</Text>
                        {getDiaryEntries(selectedDate).map(diary => (
                          <Box key={diary.id} p={3} bg="gray.50" borderRadius="md" mb={2}>
                            <Text fontWeight="bold">{diary.title}</Text>
                            <Text>{diary.content}</Text>
                            <Flex mt={2} fontSize="sm" color="gray.500">
                              <Text mr={2}>Mood: {diary.mood}</Text>
                              <Text>Weather: {diary.weather}</Text>
                            </Flex>
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Text>No diary entries for {selectedDate.toLocaleDateString()}.</Text>
                    )}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box p={4}>
                    <Heading as="h4" size="md" mb={4}>Events</Heading>
                    {isLoading.events ? (
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
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default CalendarPage;
