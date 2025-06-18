import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useCalendarService } from '../services/calendarService';
import type {TodoResponse, DiaryResponse, EventResponse, TodoRequest, DiaryRequest, EventRequest} from '../types/calendar';

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

  // Handle Todo form input changes
  const handleTodoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTodoForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (todoFormErrors[name as keyof typeof todoFormErrors]) {
      setTodoFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Diary form input changes
  const handleDiaryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDiaryForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (diaryFormErrors[name as keyof typeof diaryFormErrors]) {
      setDiaryFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Event form input changes
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (eventFormErrors[name as keyof typeof eventFormErrors]) {
      setEventFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Todo number input changes
  const handleTodoNumberInputChange = (name: string, value: string) => {
    const numberValue = parseInt(value);
    setTodoForm(prev => ({ ...prev, [name]: numberValue }));

    // Clear validation error when user types
    if (todoFormErrors[name as keyof typeof todoFormErrors]) {
      setTodoFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Event number input changes
  const handleEventNumberInputChange = (name: string, value: string) => {
    const numberValue = parseInt(value);
    setEventForm(prev => ({ ...prev, [name]: numberValue }));

    // Clear validation error when user types
    if (eventFormErrors[name as keyof typeof eventFormErrors]) {
      setEventFormErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  // Day of week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Todo creation modal
  const renderTodoModal = () => {
    return (
      <Modal isOpen={isTodoModalOpen} onClose={onTodoModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Todo</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!todoFormErrors.title} mb={4}>
              <FormLabel>Title</FormLabel>
              <Input 
                name="title"
                value={todoForm.title}
                onChange={handleTodoInputChange}
                placeholder="Enter todo title"
              />
              {todoFormErrors.title && <FormErrorMessage>{todoFormErrors.title}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!todoFormErrors.content} mb={4}>
              <FormLabel>Content</FormLabel>
              <Textarea 
                name="content"
                value={todoForm.content}
                onChange={handleTodoInputChange}
                placeholder="Enter todo description"
              />
              {todoFormErrors.content && <FormErrorMessage>{todoFormErrors.content}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!todoFormErrors.dueDate} mb={4}>
              <FormLabel>Due Date & Time</FormLabel>
              <Input 
                name="dueDate"
                type="datetime-local"
                value={todoForm.dueDate}
                onChange={handleTodoInputChange}
              />
              {todoFormErrors.dueDate && <FormErrorMessage>{todoFormErrors.dueDate}</FormErrorMessage>}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Repeat</FormLabel>
              <Select 
                name="repeatType"
                value={todoForm.repeatType}
                onChange={handleTodoInputChange}
              >
                <option value="NONE">No Repeat</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </Select>
            </FormControl>

            {todoForm.repeatType !== 'NONE' && (
              <>
                <FormControl isInvalid={!!todoFormErrors.repeatInterval} mb={4}>
                  <FormLabel>Repeat Every</FormLabel>
                  <NumberInput 
                    min={1} 
                    value={todoForm.repeatInterval}
                    onChange={(value) => handleTodoNumberInputChange('repeatInterval', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {todoFormErrors.repeatInterval && <FormErrorMessage>{todoFormErrors.repeatInterval}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!todoFormErrors.repeatEndDate} mb={4}>
                  <FormLabel>Repeat Until</FormLabel>
                  <Input 
                    name="repeatEndDate"
                    type="date"
                    value={todoForm.repeatEndDate}
                    onChange={handleTodoInputChange}
                  />
                  {todoFormErrors.repeatEndDate && <FormErrorMessage>{todoFormErrors.repeatEndDate}</FormErrorMessage>}
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleTodoSubmit}
              isLoading={isLoading.createTodo}
            >
              Create
            </Button>
            <Button onClick={onTodoModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Diary creation modal
  const renderDiaryModal = () => {
    return (
      <Modal isOpen={isDiaryModalOpen} onClose={onDiaryModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Diary Entry</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!diaryFormErrors.title} mb={4}>
              <FormLabel>Title</FormLabel>
              <Input 
                name="title"
                value={diaryForm.title}
                onChange={handleDiaryInputChange}
                placeholder="Enter diary title"
              />
              {diaryFormErrors.title && <FormErrorMessage>{diaryFormErrors.title}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!diaryFormErrors.content} mb={4}>
              <FormLabel>Content</FormLabel>
              <Textarea 
                name="content"
                value={diaryForm.content}
                onChange={handleDiaryInputChange}
                placeholder="Enter diary content"
                minH="150px"
              />
              {diaryFormErrors.content && <FormErrorMessage>{diaryFormErrors.content}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!diaryFormErrors.date} mb={4}>
              <FormLabel>Date</FormLabel>
              <Input 
                name="date"
                type="date"
                value={diaryForm.date}
                onChange={handleDiaryInputChange}
              />
              {diaryFormErrors.date && <FormErrorMessage>{diaryFormErrors.date}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!diaryFormErrors.mood} mb={4}>
              <FormLabel>Mood</FormLabel>
              <Select 
                name="mood"
                value={diaryForm.mood}
                onChange={handleDiaryInputChange}
              >
                <option value="행복">행복</option>
                <option value="기쁨">기쁨</option>
                <option value="슬픔">슬픔</option>
                <option value="화남">화남</option>
                <option value="평온">평온</option>
              </Select>
              {diaryFormErrors.mood && <FormErrorMessage>{diaryFormErrors.mood}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!diaryFormErrors.weather} mb={4}>
              <FormLabel>Weather</FormLabel>
              <Select 
                name="weather"
                value={diaryForm.weather}
                onChange={handleDiaryInputChange}
              >
                <option value="맑음">맑음</option>
                <option value="흐림">흐림</option>
                <option value="비">비</option>
                <option value="눈">눈</option>
                <option value="안개">안개</option>
              </Select>
              {diaryFormErrors.weather && <FormErrorMessage>{diaryFormErrors.weather}</FormErrorMessage>}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleDiarySubmit}
              isLoading={isLoading.createDiary}
            >
              Create
            </Button>
            <Button onClick={onDiaryModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Event creation modal
  const renderEventModal = () => {
    return (
      <Modal isOpen={isEventModalOpen} onClose={onEventModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!eventFormErrors.title} mb={4}>
              <FormLabel>Title</FormLabel>
              <Input 
                name="title"
                value={eventForm.title}
                onChange={handleEventInputChange}
                placeholder="Enter event title"
              />
              {eventFormErrors.title && <FormErrorMessage>{eventFormErrors.title}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!eventFormErrors.description} mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                name="description"
                value={eventForm.description}
                onChange={handleEventInputChange}
                placeholder="Enter event description"
              />
              {eventFormErrors.description && <FormErrorMessage>{eventFormErrors.description}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!eventFormErrors.startDateTime} mb={4}>
              <FormLabel>Start Date & Time</FormLabel>
              <Input 
                name="startDateTime"
                type="datetime-local"
                value={eventForm.startDateTime}
                onChange={handleEventInputChange}
              />
              {eventFormErrors.startDateTime && <FormErrorMessage>{eventFormErrors.startDateTime}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!eventFormErrors.endDateTime} mb={4}>
              <FormLabel>End Date & Time</FormLabel>
              <Input 
                name="endDateTime"
                type="datetime-local"
                value={eventForm.endDateTime}
                onChange={handleEventInputChange}
              />
              {eventFormErrors.endDateTime && <FormErrorMessage>{eventFormErrors.endDateTime}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!eventFormErrors.location} mb={4}>
              <FormLabel>Location</FormLabel>
              <Input 
                name="location"
                value={eventForm.location}
                onChange={handleEventInputChange}
                placeholder="Enter event location"
              />
              {eventFormErrors.location && <FormErrorMessage>{eventFormErrors.location}</FormErrorMessage>}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Event Type</FormLabel>
              <Select 
                name="eventType"
                value={eventForm.eventType}
                onChange={handleEventInputChange}
              >
                <option value="PERSONAL">Personal</option>
                <option value="WORK">Work</option>
                <option value="FAMILY">Family</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Repeat</FormLabel>
              <Select 
                name="repeatType"
                value={eventForm.repeatType}
                onChange={handleEventInputChange}
              >
                <option value="NONE">No Repeat</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </Select>
            </FormControl>

            {eventForm.repeatType !== 'NONE' && (
              <>
                <FormControl isInvalid={!!eventFormErrors.repeatInterval} mb={4}>
                  <FormLabel>Repeat Every</FormLabel>
                  <NumberInput 
                    min={1} 
                    value={eventForm.repeatInterval}
                    onChange={(value) => handleEventNumberInputChange('repeatInterval', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {eventFormErrors.repeatInterval && <FormErrorMessage>{eventFormErrors.repeatInterval}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!eventFormErrors.repeatEndDate} mb={4}>
                  <FormLabel>Repeat Until</FormLabel>
                  <Input 
                    name="repeatEndDate"
                    type="date"
                    value={eventForm.repeatEndDate}
                    onChange={handleEventInputChange}
                  />
                  {eventFormErrors.repeatEndDate && <FormErrorMessage>{eventFormErrors.repeatEndDate}</FormErrorMessage>}
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleEventSubmit}
              isLoading={isLoading.createEvent}
            >
              Create
            </Button>
            <Button onClick={onEventModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading as="h4" size="md">Todo List</Heading>
                      <Button 
                        colorScheme="blue" 
                        size="sm" 
                        onClick={handleOpenTodoModal}
                        isDisabled={!selectedDate}
                      >
                        Create
                      </Button>
                    </Flex>
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
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading as="h4" size="md">Diary Entries</Heading>
                      <Button 
                        colorScheme="blue" 
                        size="sm" 
                        onClick={handleOpenDiaryModal}
                        isDisabled={!selectedDate}
                      >
                        Create
                      </Button>
                    </Flex>
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
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading as="h4" size="md">Events</Heading>
                      <Button 
                        colorScheme="blue" 
                        size="sm" 
                        onClick={handleOpenEventModal}
                        isDisabled={!selectedDate}
                      >
                        Create
                      </Button>
                    </Flex>
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
