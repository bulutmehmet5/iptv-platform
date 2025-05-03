import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { XtreamCredentials, UserSession } from '@/types/auth';
import { authenticate } from '@/lib/api/xtream';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  credentials: XtreamCredentials | null;
  userSession: UserSession | null;
  login: (credentials: XtreamCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      credentials: null,
      userSession: null,
      
      login: async (credentials: XtreamCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authenticate(credentials);
          
          if (response.user_info.auth !== 1) {
            throw new Error('Authentication failed');
          }
          
          const userSession: UserSession = {
            username: credentials.username,
            password: credentials.password,
            server: credentials.server,
            expDate: response.user_info.exp_date,
            maxConnections: response.user_info.max_connections,
            activeConnections: response.user_info.active_cons,
            isTrial: response.user_info.is_trial === '1',
            createdAt: response.user_info.created_at,
          };
          
          set({
            isAuthenticated: true,
            credentials,
            userSession,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
            isAuthenticated: false,
            credentials: null,
            userSession: null,
          });
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          credentials: null,
          userSession: null,
          error: null,
        });
      },
    }),
    {
      name: 'iptv-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        credentials: state.credentials,
        userSession: state.userSession,
      }),
    }
  )
);