import type {Member} from "../member";
import type {MapData} from "../map";

export interface MemoryFormData {
  title: string;
  content: string;
  locationName: string;
  mapId: number | null;
  memoryType: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';
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
  files: FileResponse[];
  createDate: string;
}

// 메모리 상세 정보 인터페이스
export interface Memory {
  id: number;
  content: string;
  memoryType: string;
  createdAt: string;
  updatedAt: string;
  locationName?: string;
  map?: MapData;
  files: Array<{
    id: number;
    fileUrl: string;
    fileType: string;
  }>;
  member: {
    id: number;
    name: string;
    nickname: string;
    profile?: {
      fileUrl: string;
    };
  };
}
