import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => set({ token, admin, isAuthenticated: true }),
      logout: () => set({ token: null, admin: null, isAuthenticated: false }),
    }),
    { name: 'ms-wedding-planner-admin-auth' },
  ),
);
