/**
 * Auth API service — call real backend endpoints.
 *
 * Usage in hook:
 *   import { authApi } from "@/api/services/auth.api";
 *   const res = await authApi.login({ email, password });
 */

import { api } from "@/api/fetcher";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  role: string;
  token: string;
  refreshToken: string;
}

export interface RefreshResponse {
  id: string;
  token: string;
}

export const authApi = {
  /** POST /auth/login */
  login: (body: LoginRequest) => api.post<LoginResponse>("/auth/login", body),

  /** POST /auth/refresh */
  refresh: (body: { refreshToken: string }) =>
    api.post<RefreshResponse>("/auth/refresh", body),
};
