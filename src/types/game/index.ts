export interface GameSetting {
  id: number;
  gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM';
  maxQuestions: number;
  timeLimitSeconds: number;
  maxDistanceForFullScoreKm: number;
  scoringFormula: string;
  isActive: boolean;
  createDate: string;
}

export interface GameSession {
  id: number;
  memberId: number;
  targetMemberId: number | null;
  gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  startTime: string;
  endTime: string | null;
  createDate: string;
}

export interface GameQuestion {
  id: number;
  sessionId: number;
  memoryId: number | null;
  questionOrder: number;
  memoryImageUrls: string[] | null;
  encryptCorrectLatitude: string;
  encryptCorrectLongitude: string;
  playerLatitude: number | null;
  playerLongitude: number | null;
  distanceKm: number | null;
  score: number;
  timeTakenSeconds: number | null;
  answeredAt: string | null;
  correctLatitude: number;
  correctLongitude: number;
  correctLocationName: string;
  createDate: string;
  isGameSessionCompleted?: boolean;
}

export interface SubmitAnswerRequest {
  playerLatitude: number;
  playerLongitude: number;
  timeTakenSeconds: number;
}

export interface CreateGameSessionRequest {
  gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM';
}

export interface CreateGameSessionData {
  gameSetting: GameSetting;
  id: number;
  memberId: number;
  targetMemberId: number | null;
  gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  startTime: string;
  endTime: string | null;
  createDate: string;
}