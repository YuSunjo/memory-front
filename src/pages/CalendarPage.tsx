import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  VStack, 
  Heading, 
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure
} from '@chakra-ui/react';
import { useCalendarService } from '../services/calendarService';
import type {TodoResponse, DiaryResponse, EventResponse, TodoRequest, DiaryRequest, EventRequest} from '../types/calendar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import TodoList from '../components/calendar/TodoList';
import TodoModal from '../components/calendar/TodoModal';
import DiaryList from '../components/calendar/DiaryList';
import DiaryModal from '../components/calendar/DiaryModal';
import EventList from '../components/calendar/EventList';
import EventModal from '../components/calendar/EventModal';

const CalendarPage: React.FC = () => {
  const calendarService = useCalendarService();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters for year and month
  const getInitialDate = () => {
    const searchParams = new URLSearchParams(location.search);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam) - 1; // Convert from 1-12 to 0-11

      // Validate the parameters
      if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
        return new Date(year, month, 1);
      }
    }

    return new Date(); // Default to current date if no valid parameters
  };

  // Date state
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date, isCurrentMonth: boolean }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data state
  const [todos, setTodos] = useState<TodoResponse[]>([]);
  const [diaries, setDiaries] = useState<DiaryResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState({
    todos: false,
    diaries: false,
    events: false,
    createTodo: false,
    createDiary: false,
    createEvent: false
  });

  // Modal state for Todo
  const { isOpen: isTodoModalOpen, onOpen: onTodoModalOpen, onClose: onTodoModalClose } = useDisclosure();

  // Modal state for Diary
  const { isOpen: isDiaryModalOpen, onOpen: onDiaryModalOpen, onClose: onDiaryModalClose } = useDisclosure();

  // Modal state for Event
  const { isOpen: isEventModalOpen, onOpen: onEventModalOpen, onClose: onEventModalClose } = useDisclosure();

  // Form state for Todo
  const [todoForm, setTodoForm] = useState<TodoRequest>({
    title: '',
    content: '',
    dueDate: '',
    repeatType: 'NONE',
    repeatInterval: 1,
    repeatEndDate: ''
  });

  // Form state for Diary
  const [diaryForm, setDiaryForm] = useState<DiaryRequest>({
    title: '',
    content: '',
    date: '',
    mood: '행복',
    weather: '맑음'
  });

  // Form state for Event
  const [eventForm, setEventForm] = useState<EventRequest>({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    eventType: 'PERSONAL',
    repeatType: 'NONE',
    repeatInterval: 1,
    repeatEndDate: ''
  });

  // Form validation state for Todo
  const [todoFormErrors, setTodoFormErrors] = useState({
    title: '',
    content: '',
    dueDate: '',
    repeatInterval: '',
    repeatEndDate: ''
  });

  // Form validation state for Diary
  const [diaryFormErrors, setDiaryFormErrors] = useState({
    title: '',
    content: '',
    date: '',
    mood: '',
    weather: ''
  });

  // Form validation state for Event
  const [eventFormErrors, setEventFormErrors] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    repeatInterval: '',
    repeatEndDate: ''
  });

  const toggleTodoChecked = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Validate Todo form
  const validateTodoForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...todoFormErrors };

    if (!todoForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!todoForm.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!todoForm.dueDate) {
      newErrors.dueDate = 'Due date is required';
      isValid = false;
    }

    if (todoForm.repeatType !== 'NONE') {
      if (!todoForm.repeatInterval || todoForm.repeatInterval < 1) {
        newErrors.repeatInterval = 'Repeat interval must be at least 1';
        isValid = false;
      }

      if (!todoForm.repeatEndDate) {
        newErrors.repeatEndDate = 'Repeat end date is required';
        isValid = false;
      }
    }

    setTodoFormErrors(newErrors);
    return isValid;
  };

  // Validate Diary form
  const validateDiaryForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...diaryFormErrors };

    if (!diaryForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!diaryForm.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!diaryForm.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!diaryForm.mood.trim()) {
      newErrors.mood = 'Mood is required';
      isValid = false;
    }

    if (!diaryForm.weather.trim()) {
      newErrors.weather = 'Weather is required';
      isValid = false;
    }

    setDiaryFormErrors(newErrors);
    return isValid;
  };

  // Validate Event form
  const validateEventForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...eventFormErrors };

    if (!eventForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!eventForm.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!eventForm.startDateTime) {
      newErrors.startDateTime = 'Start date and time is required';
      isValid = false;
    }

    if (!eventForm.endDateTime) {
      newErrors.endDateTime = 'End date and time is required';
      isValid = false;
    }

    if (!eventForm.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    if (eventForm.repeatType !== 'NONE') {
      if (!eventForm.repeatInterval || eventForm.repeatInterval < 1) {
        newErrors.repeatInterval = 'Repeat interval must be at least 1';
        isValid = false;
      }

      if (!eventForm.repeatEndDate) {
        newErrors.repeatEndDate = 'Repeat end date is required';
        isValid = false;
      }
    }

    setEventFormErrors(newErrors);
    return isValid;
  };

  // Handle Todo form submission
  const handleTodoSubmit = async () => {
    if (!validateTodoForm()) return;

    setIsLoading(prev => ({ ...prev, createTodo: true }));

    try {
      // Prepare the request data
      const requestData: TodoRequest = {
        title: todoForm.title,
        content: todoForm.content,
        dueDate: todoForm.dueDate
      };

      // Add repeat fields if not NONE
      if (todoForm.repeatType !== 'NONE') {
        requestData.repeatType = todoForm.repeatType;
        requestData.repeatInterval = todoForm.repeatInterval;
        requestData.repeatEndDate = todoForm.repeatEndDate;
      }

      // Call the API
      const result = await calendarService.createTodo(requestData);

      if (result) {
        // Close the modal and reset form
        onTodoModalClose();
        resetTodoForm();

        // Refresh the todos list
        if (calendarDays.length > 0 && calendarDays[0].date && calendarDays[calendarDays.length - 1].date) {
          fetchTodos(calendarDays[0].date, calendarDays[calendarDays.length - 1].date);
        }
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, createTodo: false }));
    }
  };

  // Handle Diary form submission
  const handleDiarySubmit = async () => {
    if (!validateDiaryForm()) return;

    setIsLoading(prev => ({ ...prev, createDiary: true }));

    try {
      // Prepare the request data
      const requestData: DiaryRequest = {
        title: diaryForm.title,
        content: diaryForm.content,
        date: diaryForm.date,
        mood: diaryForm.mood,
        weather: diaryForm.weather
      };

      // Call the API
      const result = await calendarService.createDiary(requestData);

      if (result) {
        // Close the modal and reset form
        onDiaryModalClose();
        resetDiaryForm();

        // Refresh the diaries list
        if (calendarDays.length > 0 && calendarDays[0].date && calendarDays[calendarDays.length - 1].date) {
          fetchDiaries(calendarDays[0].date, calendarDays[calendarDays.length - 1].date);
        }
      }
    } catch (error) {
      console.error('Error creating diary:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, createDiary: false }));
    }
  };

  // Handle Event form submission
  const handleEventSubmit = async () => {
    if (!validateEventForm()) return;

    setIsLoading(prev => ({ ...prev, createEvent: true }));

    try {
      // Prepare the request data
      const requestData: EventRequest = {
        title: eventForm.title,
        description: eventForm.description,
        startDateTime: eventForm.startDateTime,
        endDateTime: eventForm.endDateTime,
        location: eventForm.location,
        eventType: eventForm.eventType
      };

      // Add repeat fields if not NONE
      if (eventForm.repeatType !== 'NONE') {
        requestData.repeatType = eventForm.repeatType;
        requestData.repeatInterval = eventForm.repeatInterval;
        requestData.repeatEndDate = eventForm.repeatEndDate;
      }

      // Call the API
      const result = await calendarService.createEvent(requestData);

      if (result) {
        // Close the modal and reset form
        onEventModalClose();
        resetEventForm();

        // Refresh the events list
        if (calendarDays.length > 0 && calendarDays[0].date && calendarDays[calendarDays.length - 1].date) {
          fetchEvents(calendarDays[0].date, calendarDays[calendarDays.length - 1].date);
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, createEvent: false }));
    }
  };

  // Reset Todo form
  const resetTodoForm = () => {
    setTodoForm({
      title: '',
      content: '',
      dueDate: '',
      repeatType: 'NONE',
      repeatInterval: 1,
      repeatEndDate: ''
    });

    setTodoFormErrors({
      title: '',
      content: '',
      dueDate: '',
      repeatInterval: '',
      repeatEndDate: ''
    });
  };

  // Reset Diary form
  const resetDiaryForm = () => {
    setDiaryForm({
      title: '',
      content: '',
      date: '',
      mood: '행복',
      weather: '맑음'
    });

    setDiaryFormErrors({
      title: '',
      content: '',
      date: '',
      mood: '',
      weather: ''
    });
  };

  // Reset Event form
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      eventType: 'PERSONAL',
      repeatType: 'NONE',
      repeatInterval: 1,
      repeatEndDate: ''
    });

    setEventFormErrors({
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      repeatInterval: '',
      repeatEndDate: ''
    });
  };

  // Open Todo modal with current date
  const handleOpenTodoModal = () => {
    if (selectedDate) {
      // Set the due date to the selected date at 5:00 PM
      const dueDate = new Date(selectedDate);
      dueDate.setHours(17, 0, 0, 0);

      setTodoForm(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      }));
    }

    onTodoModalOpen();
  };

  // Open Diary modal with current date
  const handleOpenDiaryModal = () => {
    if (selectedDate) {
      // Set the date to the selected date
      setDiaryForm(prev => ({
        ...prev,
        date: formatDate(selectedDate) // Format: YYYY-MM-DD
      }));
    }

    onDiaryModalOpen();
  };

  // Open Event modal with current date
  const handleOpenEventModal = () => {
    if (selectedDate) {
      // Set the start and end date to the selected date
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(9, 0, 0, 0);

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(10, 0, 0, 0);

      setEventForm(prev => ({
        ...prev,
        startDateTime: startDateTime.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
        endDateTime: endDateTime.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      }));
    }

    onEventModalOpen();
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

  // Helper function to update URL and state
  const updateDateAndURL = (newDate: Date) => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1; // Convert from 0-11 to 1-12 for URL

    // Update URL with query parameters
    navigate(`/calendar?year=${year}&month=${month}`, { replace: true });

    // Update state
    setCurrentDate(newDate);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    updateDateAndURL(newDate);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    updateDateAndURL(newDate);
  };

  // Navigate to previous year
  const goToPreviousYear = () => {
    const newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    updateDateAndURL(newDate);
  };

  // Navigate to next year
  const goToNextYear = () => {
    const newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
    updateDateAndURL(newDate);
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

  // Todo creation modal
  const renderTodoModal = () => {
    return (
      <TodoModal 
        isOpen={isTodoModalOpen}
        onClose={onTodoModalClose}
        initialData={todoForm}
        isLoading={isLoading.createTodo}
        onSubmit={handleTodoSubmit}
      />
    );
  };

  // Diary creation modal
  const renderDiaryModal = () => {
    return (
      <DiaryModal 
        isOpen={isDiaryModalOpen}
        onClose={onDiaryModalClose}
        initialData={diaryForm}
        isLoading={isLoading.createDiary}
        onSubmit={handleDiarySubmit}
      />
    );
  };

  // Event creation modal
  const renderEventModal = () => {
    return (
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={onEventModalClose}
        initialData={eventForm}
        isLoading={isLoading.createEvent}
        onSubmit={handleEventSubmit}
      />
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Render the creation modals */}
      {renderTodoModal()}
      {renderDiaryModal()}
      {renderEventModal()}

      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Calendar</Heading>

        <Box p={6} bg="white" boxShadow="md" borderRadius="md">
          <CalendarGrid 
            currentDate={currentDate}
            calendarDays={calendarDays}
            selectedDate={selectedDate}
            todos={todos}
            diaries={diaries}
            events={events}
            onDateSelect={setSelectedDate}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onPreviousYear={goToPreviousYear}
            onNextYear={goToNextYear}
          />

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
                  <TodoList 
                    selectedDate={selectedDate}
                    todos={todos}
                    isLoading={isLoading.todos}
                    onToggleTodo={toggleTodoChecked}
                    onOpenCreateModal={handleOpenTodoModal}
                  />
                </TabPanel>
                <TabPanel>
                  <DiaryList 
                    selectedDate={selectedDate}
                    diaries={diaries}
                    isLoading={isLoading.diaries}
                    onOpenCreateModal={handleOpenDiaryModal}
                  />
                </TabPanel>
                <TabPanel>
                  <EventList 
                    selectedDate={selectedDate}
                    events={events}
                    isLoading={isLoading.events}
                    onOpenCreateModal={handleOpenEventModal}
                  />
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
