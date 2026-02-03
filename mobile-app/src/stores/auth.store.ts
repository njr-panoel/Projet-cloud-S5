import { defineStore } from 'pinia';
import { authService } from '../services/auth.service';
import { User } from 'firebase/auth';
import { Preferences } from '@capacitor/preferences';

const USER_KEY = 'auth_user_uid';

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null, initialized: false, unsubscribe: null as (() => void) | null }),
  getters: {
    isAuthenticated: (state) => !!state.user
  },
  actions: {
    async init() {
      if (this.initialized) return;
      this.unsubscribe = authService.onChange(async (user) => {
        this.user = user;
        if (user) {
          await Preferences.set({ key: USER_KEY, value: user.uid });
        } else {
          await Preferences.remove({ key: USER_KEY });
        }
      });
      this.initialized = true;
    },
    async login(email: string, password: string): Promise<boolean> {
      try {
        const user = await authService.login(email, password);
        this.user = user;
        return true;
      } catch (e) {
        return false;
      }
    },
    async logout() {
      await authService.logout();
      this.user = null;
    },
    $reset() {
      this.unsubscribe?.();
      this.user = null;
      this.initialized = false;
    }
  }
});
