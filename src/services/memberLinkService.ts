import useApi from '../hooks/useApi';
import type { 
  MemberLink, 
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

  return {
    fetchMemberLinks,
    createMemberLink,
    updateMemberLink,
    updateLinkOrder,
    deleteMemberLink
  };
};
