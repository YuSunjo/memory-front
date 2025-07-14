export interface MemberLink {
  id: number;
  title: string;
  url: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  iconUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface MemberInfo {
  id: number;
  email: string;
  name: string;
  nickname: string;
  memberType: string;
  profile?: {
    fileUrl: string;
  } | null;
}

export interface PublicMemberLinksResponse {
  memberLinks: MemberLink[];
  member: MemberInfo;
}

export interface CreateMemberLinkRequest {
  title: string;
  url: string;
  description: string;
  isActive: boolean;
  isVisible: boolean;
  iconUrl: string;
}

export interface UpdateMemberLinkRequest {
  title: string;
  url: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  iconUrl: string;
}

export interface UpdateLinkOrderRequest {
  displayOrder: number;
}
