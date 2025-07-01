import useApi from '../hooks/useApi';
import type {TodoResponse, DiaryResponse, EventResponse, DdayEventResponse, TodoRequest, DiaryRequest, EventRequest} from '../types/calendar';

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

  const createTodo = async (todoData: TodoRequest): Promise<{ data: TodoResponse | null; error?: string }> => {
    try {
      const response = await api.post<TodoResponse, TodoRequest>('/v1/todos', todoData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error creating todo:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create todo';
      return { data: null, error: errorMessage };
    }
  };

  const createDiary = async (diaryData: DiaryRequest): Promise<{ data: DiaryResponse | null; error?: string }> => {
    try {
      const response = await api.post<DiaryResponse, DiaryRequest>('/v1/diaries', diaryData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error creating diary:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create diary';
      return { data: null, error: errorMessage };
    }
  };

  const createEvent = async (eventData: EventRequest): Promise<{ data: EventResponse | null; error?: string }> => {
    try {
      const response = await api.post<EventResponse, EventRequest>('/v1/calendar/events', eventData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      return { data: null, error: errorMessage };
    }
  };

  const fetchDdayEvents = async (): Promise<DdayEventResponse[]> => {
    try {
      const response = await api.get<DdayEventResponse[]>('/v1/calendar/events/dday');
      console.log('🔥 Raw API response:', response.data); // 디버깅용
      
      const data = response.data.data;
      
      // 배열이 비어있는 경우
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('💭 No dday events found');
        return [];
      }
      
      console.log(`📅 Found ${data.length} dday events`);
      return data;
    } catch (error) {
      console.error('Error fetching dday events:', error);
      return [];
    }
  };

  return {
    fetchTodos,
    fetchDiaries,
    fetchEvents,
    fetchDdayEvents,
    createTodo,
    createDiary,
    createEvent
  };
};
