export interface MemberResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  memberType: string;
  profile: null | {
    fileUrl: string;
  };
}

export interface TodoRequest {
  title: string;
  content: string;
  dueDate: string;
}

export interface DiaryRequest {
  title: string;
  content: string;
  date: string;
  mood: string;
  weather: string;
}

export interface EventRequest {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  location: string;
  eventType: string;
  isDday?: boolean;
  repeatType?: string;
  repeatInterval?: number;
  repeatEndDate?: string;
}

export interface TodoResponse {
  id: number;
  title: string;
  content: string;
  dueDate: string;
  completed: boolean;
  member: MemberResponse;
  createDate: string;
  updateDate: string;
  routineId?: number;
  routine?: boolean;
}

export interface RoutinePreview {
  routineId: number;
  title: string;
  content: string;
  targetDate: string;
  preview: boolean;
}

export interface CombinedTodoResponse {
  actualTodos: TodoResponse[];
  routinePreviews: RoutinePreview[];
}

export interface DiaryResponse {
  id: number;
  title: string;
  content: string;
  date: string;
  mood: string;
  weather: string;
  member: MemberResponse;
  createDate: string;
  updateDate: string;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  member: MemberResponse;
  createDate: string;
  repeatType: string;
  repeatInterval: number | null;
  repeatEndDate: string | null;
}

export interface DdayEventResponse {
  id: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  member: MemberResponse;
  createDate: string;
  dday: number; // D-day까지 남은 일수
}

// Routine interfaces
export interface RoutineRequest {
  title: string;
  content: string;
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  startDate: string;
  endDate: string | null;
}

export interface RoutineResponse {
  id: number;
  title: string;
  content: string;
  active: boolean;
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  startDate: string;
  endDate: string | null;
}
