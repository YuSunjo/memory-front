import useApi from '../hooks/useApi';
import type {TodoResponse, DiaryResponse, EventResponse} from '../types/calendar';

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

  return {
    fetchTodos,
    fetchDiaries,
    fetchEvents
  };
};