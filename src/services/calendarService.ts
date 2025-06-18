import useApi from '../hooks/useApi';
import type {TodoResponse, DiaryResponse, EventResponse, TodoRequest, DiaryRequest, EventRequest} from '../types/calendar';

export const useCalendarService = () => {
  const api = useApi();

  const fetchTodos = async (startDate: string, endDate: string): Promise<TodoResponse[]> => {
    try {
      const response = await api.get<TodoResponse[]>(`/v1/todos/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  };

  const fetchDiaries = async (startDate: string, endDate: string): Promise<DiaryResponse[]> => {
    try {
      const response = await api.get<DiaryResponse[]>(`/v1/diaries/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching diaries:', error);
      return [];
    }
  };

  const fetchEvents = async (startDate: string, endDate: string): Promise<EventResponse[]> => {
    try {
      const response = await api.get<EventResponse[]>(`/v1/calendar/events?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const createTodo = async (todoData: TodoRequest): Promise<TodoResponse | null> => {
    try {
      const response = await api.post<TodoResponse, TodoRequest>('/api/v1/todos', todoData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      return null;
    }
  };

  const createDiary = async (diaryData: DiaryRequest): Promise<DiaryResponse | null> => {
    try {
      const response = await api.post<DiaryResponse, DiaryRequest>('/api/v1/diaries', diaryData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating diary:', error);
      return null;
    }
  };

  const createEvent = async (eventData: EventRequest): Promise<EventResponse | null> => {
    try {
      const response = await api.post<EventResponse, EventRequest>('/api/v1/calendar/events', eventData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  };

  return {
    fetchTodos,
    fetchDiaries,
    fetchEvents,
    createTodo,
    createDiary,
    createEvent
  };
};
