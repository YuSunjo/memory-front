import { create } from 'zustand';
import axios from 'axios';

interface Member {
  id?: number;
  email?: string;
  name?: string;
  nickname?: string;
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
}

const useMemberStore = create<MemberState>((set, get) => ({
  member: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/v1/member/login`;

      const response = await axios.post(apiUrl, {
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

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      set({ error: 'No access token found' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/v1/member/me`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

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

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        get().logout();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setMember: (member: Member) => {
    set({ member, isAuthenticated: true });
  }
}));

export default useMemberStore;