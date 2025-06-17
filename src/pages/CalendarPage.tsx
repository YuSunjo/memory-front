import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Initialize to June 2025
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date | null, isCurrentMonth: boolean }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 5, 17)); // Initialize to June 17, 2025

  const [todoItems, setTodoItems] = useState([
    { id: 1, text: "Prepare presentation for meeting", isChecked: true },
    { id: 2, text: "Call Sarah about project", isChecked: true },
    { id: 3, text: "Submit quarterly report", isChecked: false },
    { id: 4, text: "This is a very long todo item title that should be truncated with ellipsis to prevent line wrapping in the UI", isChecked: false },
  ]);

  const toggleTodoChecked = (id: number) => {
    setTodoItems(todoItems.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const hasTodoItems = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getFullYear() === 2025 && 
           date.getMonth() === 5 && // June is month 5 (0-indexed)
           date.getDate() === 17;
  };

  const getTodoItems = (date: Date | null): Array<{ id: number, text: string, isChecked: boolean }> => {
    if (!hasTodoItems(date)) return [];
    return todoItems;
  };

  // Check if a date has events
  const hasEvents = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getFullYear() === 2025 && 
           date.getMonth() === 5 && // June is month 5 (0-indexed)
           date.getDate() === 17;
  };

  // Get events for a specific date
  const getEvents = (date: Date | null): Array<{ title: string, time?: string, location?: string }> => {
    if (!hasEvents(date)) return [];
    return [
      { title: "Team Meeting", time: "10:00 AM - 11:30 AM", location: "Conference Room A" },
      { title: "Project Deadline", time: "5:00 PM" }
    ];
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

  // Generate calendar days
  useEffect(() => {
    const days: Array<{ date: Date | null, isCurrentMonth: boolean }> = [];

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
                            Todo: {getTodoItems(day.date).length}
                          </Text>
                        )}
                        {hasEvents(day.date) && (
                          <Text fontSize="xs" color="blue.500">
                            Event: {getEvents(day.date).length}
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
                    {!selectedDate ? (
                      <Text>Select a date to view todo items.</Text>
                    ) : selectedDate.getFullYear() === 2025 && 
                       selectedDate.getMonth() === 5 && // June is month 5 (0-indexed)
                       selectedDate.getDate() === 17 ? (
                      <>
                        <Text fontWeight="bold" mb={2}>June 17, 2025 Todo Items:</Text>
                        {todoItems.map(item => (
                          <Box key={item.id} p={2} bg="gray.50" borderRadius="md" mb={2}>
                            <Checkbox 
                              isChecked={item.isChecked} 
                              onChange={() => toggleTodoChecked(item.id)}
                              colorScheme="blue"
                            >
                              <Text noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                                {item.text}
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
                    {!selectedDate ? (
                      <Text>Select a date to view diary entries.</Text>
                    ) : selectedDate.getFullYear() === 2025 && 
                       selectedDate.getMonth() === 5 && // June is month 5 (0-indexed)
                       selectedDate.getDate() === 17 ? (
                      <>
                        <Text fontWeight="bold" mb={2}>June 17, 2025 Diary Entry:</Text>
                        <Box p={3} bg="gray.50" borderRadius="md">
                          <Text>Today was a productive day. I finished the main part of my project and received positive feedback from the team. Looking forward to the next phase!</Text>
                        </Box>
                      </>
                    ) : (
                      <Text>No diary entries for {selectedDate.toLocaleDateString()}.</Text>
                    )}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box p={4}>
                    <Heading as="h4" size="md" mb={4}>Events</Heading>
                    {!selectedDate ? (
                      <Text>Select a date to view events.</Text>
                    ) : selectedDate.getFullYear() === 2025 && 
                       selectedDate.getMonth() === 5 && // June is month 5 (0-indexed)
                       selectedDate.getDate() === 17 ? (
                      <>
                        <Text fontWeight="bold" mb={2}>June 17, 2025 Events:</Text>
                        <Box p={2} bg="gray.50" borderRadius="md" mb={2}>
                          <Text fontWeight="bold">Team Meeting</Text>
                          <Text>10:00 AM - 11:30 AM</Text>
                          <Text fontSize="sm">Conference Room A</Text>
                        </Box>
                        <Box p={2} bg="gray.50" borderRadius="md">
                          <Text fontWeight="bold">Project Deadline</Text>
                          <Text>5:00 PM</Text>
                        </Box>
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
