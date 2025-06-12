import { create } from 'zustand';
import { AxiosError } from 'axios';
import { api } from '../hooks/useApi';

interface Profile {
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

interface Member {
  id?: number;
  email?: string;
  name?: string;
  nickname?: string;
  memberType?: string;
  profile?: Profile;
  fileId?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface MemberState {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMemberInfo: () => Promise<void>;
  setMember: (member: Member) => void;
  updateMemberProfile: (nickname: string, fileId?: number) => Promise<boolean>;
}

const useMemberStore = create<MemberState>((set, get) => ({
  member: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/v1/member/login', {
        email,
        password
      });

      if (response.status === 200 || response.status === 201) {
        const { accessToken, refreshToken } = response.data.data as AuthTokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({ isAuthenticated: true });

        await get().fetchMemberInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: 'Failed to login. Please check your credentials.' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      member: null,
      isAuthenticated: false,
      error: null
    });
  },

  fetchMemberInfo: async () => {
    if (get().member) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/v1/member/me');

      if (response.status === 200) {
        const memberData = response.data.data as Member;
        set({
          member: memberData,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Error fetching member info:', error);
      set({ error: 'Failed to fetch member information' });

      if (error instanceof AxiosError && error.response?.status === 401) {
        get().logout();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setMember: (member: Member) => {
    set({ member, isAuthenticated: true });
  },

  updateMemberProfile: async (nickname: string, fileId?: number) => {
    set({ isLoading: true, error: null });

    try {
      const updateData: Partial<Member> = { nickname };
      if (fileId) {
        updateData.fileId = fileId;
      }

      const response = await api.put('/v1/member/me', updateData);

      if (response.status === 200) {
        // Update the member in the store with the new data
        const currentMember = get().member;
        if (currentMember) {
          set({
            member: {
              ...currentMember,
              ...updateData
            }
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating member profile:', error);
      set({ error: 'Failed to update member profile' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useMemberStore;
