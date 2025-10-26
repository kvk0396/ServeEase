import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, Role } from '../types';
import { apiClient } from '../lib/api';

interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.login({ email, password });
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          
          set({
            user: response,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        try {
          set({ isLoading: true });
          await apiClient.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      validateToken: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          return false;
        }

        try {
          const response = await apiClient.validateToken();
          set({
            user: response,
            token: response.token,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions
export const isCustomer = (user: AuthResponse | null): boolean => {
  return user?.role === 'CUSTOMER';
};

export const isProvider = (user: AuthResponse | null): boolean => {
  return user?.role === 'SERVICE_PROVIDER';
};

export const isAdmin = (user: AuthResponse | null): boolean => {
  return user?.role === 'ADMIN';
};

export const getUserRole = (user: AuthResponse | null): Role | null => {
  return user?.role || null;
}; 