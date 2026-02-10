import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';

// Safe storage handler that checks if localStorage is available
const safeStorage = {
  getItem: (name: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch (e) {
      // localStorage is not available (e.g., private browsing, iframe)
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch (e) {
      // localStorage is not available, silently fail
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch (e) {
      // localStorage is not available, silently fail
    }
  }
};

interface AuthStore extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data: LoginRequest) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Ignore logout errors
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const { token, user } = get();
        if (!token) return false;

        // If we already have user data, just verify token is still valid
        set({ isLoading: true });
        try {
          const email = await authService.checkAuth();
          if (email) {
            // Token is valid, keep existing user if email matches
            if (user && user.email === email) {
              set({ isAuthenticated: true, isLoading: false });
              return true;
            }
            // Token is valid but we don't have full user data
            set({ isAuthenticated: true, isLoading: false });
            return true;
          }
          // Token is invalid
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
