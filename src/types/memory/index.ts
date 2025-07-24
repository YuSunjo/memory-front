import type {Member} from "../member";
import type {MapData} from "../map";

export * from './comment';

export interface MemoryFormData {
  title: string;
  content: string;
  locationName: string;
  mapId: number | null;
  memoryType: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';
  memorableDate: string;
  fileIdList?: number[];
}

export interface FileResponse {
  id: number;
  originalFileName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  memoryId: number;
  memberId: number;
  createDate: string;
}

export interface MemoryResponse {
  id: number;
  title: string;
  content: string;
  locationName: string;
  member: Member;
  map: MapData;
  memoryType: 'PUBLIC';
  memorableDate: string;
  files: FileResponse[];
  createDate: string;
  updateDate: string;
  commentsCount?: number; // 댓글 수 추가
}