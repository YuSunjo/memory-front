export interface MemoryFormData {
  title: string;
  content: string;
  locationName: string;
  mapId: number | null;
  memoryType: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';
}