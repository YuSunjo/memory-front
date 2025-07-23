import { useState, useCallback } from 'react';
import { useRoutineService } from '../services/routineService';
import type { RoutineRequest, RoutineResponse } from '../types/calendar';

export const useRoutine = () => {
  const routineService = useRoutineService();
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create or update a routine
  const createRoutine = useCallback(async (routineData: RoutineRequest, routineId?: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (routineId) {
        // Update existing routine
        const result = await routineService.updateRoutine(routineId, routineData);
        if (result.error) {
          setError(result.error);
          return false;
        }
        if (result.data) {
          setRoutines(prev => prev.map(routine => routine.id === routineId ? result.data! : routine));
        }
      } else {
        // Create new routine
        const result = await routineService.createRoutine(routineData);
        if (result.error) {
          setError(result.error);
          return false;
        }
        if (result.data) {
          setRoutines(prev => [...prev, result.data!]);
        }
      }
      return true;
    } catch (error) {
      setError(routineId ? 'Failed to update routine' : 'Failed to create routine');
      console.error('Error with routine:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [routineService]);

  // Fetch all routines
  const fetchRoutines = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRoutines = await routineService.getRoutines();
      setRoutines(fetchedRoutines);
    } catch (error) {
      setError('Failed to fetch routines');
      console.error('Error fetching routines:', error);
    } finally {
      setIsLoading(false);
    }
  }, [routineService]);

  // Update a routine
  const updateRoutine = useCallback(async (id: number, routineData: RoutineRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await routineService.updateRoutine(id, routineData);
      if (result.error) {
        setError(result.error);
        return false;
      }
      if (result.data) {
        setRoutines(prev => prev.map(routine => routine.id === id ? result.data! : routine));
      }
      return true;
    } catch (error) {
      setError('Failed to update routine');
      console.error('Error updating routine:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [routineService]);

  // Delete a routine
  const deleteRoutine = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await routineService.deleteRoutine(id);
      if (result.error) {
        setError(result.error);
        return false;
      }
      if (result.success) {
        setRoutines(prev => prev.filter(routine => routine.id !== id));
      }
      return true;
    } catch (error) {
      setError('Failed to delete routine');
      console.error('Error deleting routine:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [routineService]);

  // Toggle routine active status
  const toggleRoutineActive = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await routineService.toggleRoutineActive(id);
      if (result.error) {
        setError(result.error);
        return false;
      }
      if (result.data) {
        setRoutines(prev => prev.map(routine => routine.id === id ? result.data! : routine));
      }
      return true;
    } catch (error) {
      setError('Failed to toggle routine');
      console.error('Error toggling routine:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [routineService]);

  return {
    routines,
    isLoading,
    error,
    createRoutine,
    fetchRoutines,
    updateRoutine,
    deleteRoutine,
    toggleRoutineActive,
    setRoutines
  };
};