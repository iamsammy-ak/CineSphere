import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create<{
  userId: string | null;
  displayName: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  setAuth: (opts: { userId: string; displayName: string; userName: string; avatarUrl?: string; accessToken: string }) => void;
  clearAuth: () => void;
}>((set) => ({
  userId: null, displayName: null, userName: null, avatarUrl: null, isAuthenticated: false,
  setAuth: ({ userId, displayName, userName, avatarUrl, accessToken }) => {
    Cookies.set('a\ccessToken', accessToken, { expires: 7, secure: false });
    set({ userId, displayName, userName, avatarUrl: avatarUrl ?? null, isAuthenticated: true });
  },
  clearAuth: () => {
    Cookies.remove('accessToken');
    set({ userId: null, displayName: null, userName: null, avatarUrl: null, isAuthenticated: false });
  },
}));
