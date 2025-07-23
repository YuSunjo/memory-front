import useApi from '../hooks/useApi';
import type { RoutineRequest, RoutineResponse } from '../types/calendar';

export const useRoutineService = () => {
  const api = useApi();

  // Create a new routine
  const createRoutine = async (routineData: RoutineRequest): Promise<{ data: RoutineResponse | null; error?: string }> => {
    try {
      const response = await api.post<RoutineResponse, RoutineRequest>('/v1/routine', routineData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error creating routine:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create routine';
      return { data: null, error: errorMessage };
    }
  };

  // Get all routines for the current user
  const getRoutines = async (): Promise<RoutineResponse[]> => {
    try {
      const response = await api.get<RoutineResponse[]>('/v1/routine');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching routines:', error);
      return [];
    }
  };

  // Update a routine
  const updateRoutine = async (id: number, routineData: RoutineRequest): Promise<{ data: RoutineResponse | null; error?: string }> => {
    try {
      const response = await api.put<RoutineResponse, RoutineRequest>(`/v1/routine/${id}`, routineData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error updating routine:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update routine';
      return { data: null, error: errorMessage };
    }
  };

  // Delete a routine
  const deleteRoutine = async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/v1/routine/${id}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting routine:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete routine';
      return { success: false, error: errorMessage };
    }
  };

  // Toggle routine active status
  const toggleRoutineActive = async (id: number): Promise<{ data: RoutineResponse | null; error?: string }> => {
    try {
      const response = await api.patch<RoutineResponse, null>(`/v1/routine/${id}/toggle`);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error toggling routine:', error);
      const errorMessage = error.response?.data?.message || 'Failed to toggle routine';
      return { data: null, error: errorMessage };
    }
  };

  return {
    createRoutine,
    getRoutines,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive
  };
};