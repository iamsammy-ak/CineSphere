import { create } from 'zustand';
import Cookies from 'js-cookie';
import { persist } from 'zustand/middleware';


interface AuthState {
  userId: string | null;
  displayName: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuth: (data: { userId: string; displayName: string; userName: string; avatarUrl?: string; accessToken: string }) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      displayName: null,
      userName: null,
      avatarUrl: null,
      isAuthenticated: false,
      accessToken: null,

      setAuth: ({ userId, displayName, userName, avatarUrl, accessToken }) => {
        Cookies.set('accessToken', accessToken, { expires: 7, secure: false });
        set({ userId, displayName, userName, avatarUrl: avatarUrl ?? null, isAuthenticated: true, accessToken });
      },

      clearAuth: () => {
        Cookies.remove('accessToken');
        set({ userId: null, displayName: null, userName: null, avatarUrl: null, isAuthenticated: false, accessToken: null });
      },
      hydrate: () => {
        const token = Cookies.get('accessToken');
        if (token && !get().isAuthenticated) {
          set({ isAuthenticated: true, accessToken: token });
        }
      },
    }),
    { name: 'cinesphere-auth', partialize: (state) => ({ userId: state.userId, displayName: state.displayName, userName: state.userName, avatarUrl: state.avatarUrl, isAuthenticated: state.isAuthenticated }) }
  )
);
