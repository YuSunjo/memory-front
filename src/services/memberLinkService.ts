import useApi from '../hooks/useApi';
import type { 
  MemberLink, 
  MemberInfo,
  PublicMemberLinksResponse,
  CreateMemberLinkRequest, 
  UpdateMemberLinkRequest, 
  UpdateLinkOrderRequest 
} from '../types/memberLink';

export const useMemberLinkService = () => {
  const api = useApi();

  // 내 링크 목록 조회
  const fetchMemberLinks = async (): Promise<MemberLink[]> => {
    try {
      const response = await api.get<MemberLink[]>('/v1/member-links');
      console.log('🔗 Fetched member links:', response.data);
      
      const data = response.data.data;
      
      // 배열이 아닌 경우 빈 배열 반환
      if (!Array.isArray(data)) {
        return [];
      }
      
      // displayOrder로 정렬
      return data.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.error('Error fetching member links:', error);
      return [];
    }
  };

  // 링크 생성
  const createMemberLink = async (linkData: CreateMemberLinkRequest): Promise<{ data: MemberLink | null; error?: string }> => {
    try {
      const response = await api.post<MemberLink, CreateMemberLinkRequest>('/v1/member-links', linkData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error creating member link:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create link';
      return { data: null, error: errorMessage };
    }
  };

  // 링크 수정
  const updateMemberLink = async (id: number, linkData: UpdateMemberLinkRequest): Promise<{ data: MemberLink | null; error?: string }> => {
    try {
      const response = await api.put<MemberLink, UpdateMemberLinkRequest>(`/v1/member-links/${id}`, linkData);
      return { data: response.data.data };
    } catch (error: any) {
      console.error('Error updating member link:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update link';
      return { data: null, error: errorMessage };
    }
  };

  // 링크 순서 변경
  const updateLinkOrder = async (id: number, orderData: UpdateLinkOrderRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.patch(`/v1/member-links/${id}/order`, orderData);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating link order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update link order';
      return { success: false, error: errorMessage };
    }
  };

  // 링크 삭제
  const deleteMemberLink = async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/v1/member-links/${id}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting member link:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete link';
      return { success: false, error: errorMessage };
    }
  };

  // 공개 링크 목록 조회 (특정 멤버의 공개된 링크만)
  const fetchPublicMemberLinks = async (memberId: number): Promise<{ links: MemberLink[], member: MemberInfo | null }> => {
    try {
      const response = await api.get<PublicMemberLinksResponse>(`/v1/members/${memberId}/links`);
      console.log('🔗 Fetched public member links:', response.data);
      
      const data = response.data.data;
      const memberLinks = data.memberLinks || [];
      const member = data.member;
      
      // 배열이 아닌 경우 빈 배열 반환
      if (!Array.isArray(memberLinks)) {
        return { links: [], member };
      }
      
      // 활성화되고 공개된 링크만 필터링하고 displayOrder로 정렬
      const filteredLinks = memberLinks
        .filter(link => link.isActive && link.isVisible)
        .sort((a, b) => a.displayOrder - b.displayOrder);
        
      return { links: filteredLinks, member };
    } catch (error) {
      console.error('Error fetching public member links:', error);
      return { links: [], member: null };
    }
  };

  return {
    fetchMemberLinks,
    fetchPublicMemberLinks,
    createMemberLink,
    updateMemberLink,
    updateLinkOrder,
    deleteMemberLink
  };
};
