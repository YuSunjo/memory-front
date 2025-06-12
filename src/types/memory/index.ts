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
