import { create } from 'zustand';
import axios from 'axios';

interface User {
  id?: number;
  email?: string;
  name?: string;
  nickname?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
  setUser: (user: User) => void;
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
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
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        set({ isAuthenticated: true });
        
        // Fetch user info
        await get().fetchUserInfo();
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
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Reset state
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  fetchUserInfo: async () => {
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
        const userData = response.data.data as User;
        set({
          user: userData,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      set({ error: 'Failed to fetch user information' });
      
      // If unauthorized, logout
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        get().logout();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  }
}));

export default useUserStore;