import type { ServerResponse } from './common';

// Autocomplete Types
export interface AutocompleteSuggestion {
  text: string;
  type: 'TITLE' | 'HASHTAG';
  matchCount: number;
  score: number;
}

export interface AutocompleteData {
  suggestions: AutocompleteSuggestion[];
  responseTimeMs: number;
  query: string;
  totalSuggestions: number;
}

export type AutocompleteResponse = ServerResponse<AutocompleteData>;

// Search Types
export interface SearchRequest {
  type: 'ALL';
  query: string;
  page: number;
  size: number;
  highlight: boolean;
}

export interface SearchMemory {
  memoryId: number;
  title: string;
  content: string;
  locationName: string;
  memorableDate: string | null;
  memorableDateText: string;
  memoryType: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';
  hashtags: string[];
  memberId: number;
  memberName: string;
  memberNickname: string;
  memberEmail: string;
  memberFileUrl: string | null;
  relationshipMemberId: number | null;
  relationshipMemberName: string | null;
  relationshipMemberNickname: string | null;
  relationshipMemberEmail: string | null;
  relationshipMemberFileUrl: string | null;
  highlights: any;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SearchMetadata {
  searchType: string;
  query: string;
  hashtags: string[] | null;
  fromDate: string | null;
  toDate: string | null;
  searchTimeMs: number;
}

export interface SearchData {
  memories: SearchMemory[];
  pageInfo: PageInfo;
  metadata: SearchMetadata;
}

export type SearchResponse = ServerResponse<SearchData>;

