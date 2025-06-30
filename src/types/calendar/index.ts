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
  repeatType?: string;
  repeatInterval?: number;
  repeatEndDate?: string;
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
  repeatType: string;
  repeatInterval: number | null;
  repeatEndDate: string | null;
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
