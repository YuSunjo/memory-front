import { useState } from 'react';
import useApi from './useApi';
import type { CreateGameSessionRequest, CreateGameSessionData, GameSession, GameSetting, GameQuestion, SubmitAnswerRequest } from '../types/game';

export const useGameApi = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGameSession = async (gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM'): Promise<{ gameSession: GameSession; gameSetting: GameSetting } | null> => {
    try {
      setLoading(true);
      setError(null);

      const request: CreateGameSessionRequest = { gameMode };
      const response = await api.post<CreateGameSessionData, CreateGameSessionRequest>('/v1/game/sessions', request);
      
      if (response.data.statusCode === 200) {
        const data = response.data.data;
        const gameSession: GameSession = {
          id: data.id,
          memberId: data.memberId,
          targetMemberId: data.targetMemberId,
          gameMode: data.gameMode,
          status: data.status,
          totalScore: data.totalScore,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers,
          accuracy: data.accuracy,
          startTime: data.startTime,
          endTime: data.endTime,
          createDate: data.createDate
        };
        
        return {
          gameSession,
          gameSetting: data.gameSetting
        };
      } else {
        throw new Error(response.data.message || 'Failed to create game session');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create game session';
      setError(errorMessage);
      console.error('Error creating game session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestion = async (sessionId: number): Promise<GameQuestion | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<GameQuestion, null>(`/v1/game/sessions/${sessionId}/next-question`);
      
      if (response.data.statusCode === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get next question');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get next question';
      setError(errorMessage);
      console.error('Error getting next question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (
    sessionId: number, 
    questionId: number, 
    answer: SubmitAnswerRequest
  ): Promise<GameQuestion | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<GameQuestion, SubmitAnswerRequest>(
        `/v1/game/sessions/${sessionId}/questions/${questionId}/answer`,
        answer
      );
      
      if (response.data.statusCode === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit answer');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit answer';
      setError(errorMessage);
      console.error('Error submitting answer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const giveUpGame = async (sessionId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.patch(`/v1/game/sessions/${sessionId}/give-up`);
      
      // 204 No Content 응답은 본문이 없으므로 HTTP 상태 코드로 판단
      if (response.status === 204) {
        return true;
      }
      
      // 200 응답의 경우 ServerResponse 형식 체크
      if (response.status === 200 && response.data?.statusCode === 200) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Failed to give up game');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to give up game';
      setError(errorMessage);
      console.error('Error giving up game:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Base64 복호화 유틸리티 함수
  const decryptCoordinate = (encryptedValue: string): number => {
    try {
      const decoded = atob(encryptedValue);
      return parseFloat(decoded);
    } catch (error) {
      console.error('Error decrypting coordinate:', error);
      return 0;
    }
  };

  return {
    createGameSession,
    getNextQuestion,
    submitAnswer,
    giveUpGame,
    decryptCoordinate,
    loading,
    error
  };
};