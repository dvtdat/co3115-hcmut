import { create } from "zustand";
import {
  getToken,
  getUser,
  logout as clearAuthStorage,
  setToken,
  setRefreshToken,
  setUser,
  type AuthUser,
} from "@/services/auth";
import { authApi } from "@/api/services/auth.api";
import { userApi } from "@/api/services/user.api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: getUser(),
  isAuthenticated: !!getToken(),

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setRefreshToken(res.refreshToken);

    const profile = await userApi.getMe();
    const user: AuthUser = {
      id: res.id,
      email: profile.email,
      role: res.role,
      fullName: profile.fullName ?? "",
      phone: profile.phone,
      deliveryAccess: profile.deliveryAccess,
    };
    setUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearAuthStorage();
    set({ user: null, isAuthenticated: false });
  },
}));
