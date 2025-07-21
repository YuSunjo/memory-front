import type { Member } from "../member";

// 댓글 인터페이스
export interface Comment {
  id: number;
  content: string;
  depth: number;
  memoryId: number;
  member: Member;
  parentCommentId: number | null;
  children: Comment[];
  childrenCount: number;
  createDate: string;
  updateDate: string;
  isDeleted: boolean;
  isAuthor: boolean;
}

// 댓글 생성 요청 데이터
export interface CreateCommentRequest {
  memoryId: number;
  content: string;
  parentCommentId?: number;
}

// 댓글 목록 응답 데이터
export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  topLevelCount: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
}

// 댓글 목록 요청 파라미터
export interface GetCommentsParams {
  memoryId: number;
  page?: number;
  size?: number;
}
