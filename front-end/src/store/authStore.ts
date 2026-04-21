import { create } from "zustand";
import {
  getToken,
  getUser,
  logout as clearAuthStorage,
  setToken,
  setUser,
  type AuthUser,
} from "@/services/auth";
import { MOCK_CREDENTIALS, MOCK_PASSWORDS, INITIAL_USERS } from "@/mock/data";

// Fixed demo credentials:
//   admin@test.com / admin123  →  role: admin
//   user@test.com  / user123   →  role: user

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: getUser(),
  isAuthenticated: !!getToken(),

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));

    const creds = MOCK_CREDENTIALS[email.toLowerCase()];
    const expectedPwd = MOCK_PASSWORDS[email.toLowerCase()];

    if (!creds || password !== expectedPwd) {
      throw new Error("Invalid email or password.");
    }

    const mockUser = INITIAL_USERS.find((u) => u.id === creds.id);
    if (!mockUser) throw new Error("User not found.");

    const user: AuthUser = {
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      role: mockUser.role,
    };

    setToken("mock-token");
    setUser(user);
    set({ user, isAuthenticated: true });
  },

  register: async (firstName, lastName, email, _password) => {
    await new Promise((r) => setTimeout(r, 500));

    // In mock mode, registration always succeeds and logs in as the user account.
    // If it's one of the demo emails, use that. Otherwise create a temporary session.
    const creds = MOCK_CREDENTIALS[email.toLowerCase()];
    const mockUser = creds ? INITIAL_USERS.find((u) => u.id === creds.id) : null;

    const user: AuthUser = {
      id: mockUser?.id ?? "usr_guest",
      email: mockUser?.email ?? email,
      firstName: mockUser?.firstName ?? firstName,
      lastName: mockUser?.lastName ?? lastName,
      role: mockUser?.role ?? "user",
    };

    setToken("mock-token");
    setUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearAuthStorage();
    set({ user: null, isAuthenticated: false });
  },
}));
