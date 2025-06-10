export interface Member {
  id: number;
  email: string;
  name: string;
  nickname: string;
  profileImageUrl: string;
}

export interface Relationship {
  id: number;
  member: Member;
  relatedMember: Member;
  relationshipStatus: string;
  startDate: string;
  endDate: string | null;
}

export interface RelationshipResponse {
  statusCode: number;
  message: string;
  data: {
    relationships: Relationship[];
  };
}

export interface ReceivedRelationshipResponse {
  statusCode: number;
  message: string;
  data: {
    relationships: Relationship[];
  };
}

export interface MemberResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    profileImageUrl: string;
  };
}