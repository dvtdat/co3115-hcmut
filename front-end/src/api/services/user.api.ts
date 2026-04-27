/**
 * User API service — call real backend endpoints.
 *
 * Usage in hook:
 *   import { userApi } from "@/api/services/user.api";
 *   const me = await userApi.getMe();
 */

import { api } from "@/api/fetcher";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BEUser {
  _id: string;
  email: string;
  role: string;       // "customer" | "admin" | "guest"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface BECustomer {
  _id: string;
  fullName: string;
  phone?: string;
  deliveryAccess?: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  deliveryAccess?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  deliveryAccess?: string;
  role?: string;       // admin only
}

export interface Paginated<T> {
  data: T[];
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const userApi = {
  /** POST /users — Register */
  register: (body: RegisterRequest) =>
    api.post<{ user: BEUser; customer: BECustomer }>("/users", body),

  /** GET /users — List all (admin) */
  list: (params?: { pageSize?: number; pageNumber?: number }) =>
    api.get<Paginated<BEUser>>("/users", params),

  /** GET /users/me — Current user profile (no password) */
  getMe: () => api.get<BEUser>("/users/me"),

  /** GET /users/:id */
  getById: (id: string) => api.get<BEUser>(`/users/${id}`),

  /** GET /users/email/:email */
  getByEmail: (email: string) => api.get<BEUser>(`/users/email/${email}`),

  /** PATCH /users/:id — Update profile */
  update: (id: string, body: UpdateUserRequest) =>
    api.patch<BEUser>(`/users/${id}`, body),

  /** PATCH /users/:id/status — Activate/deactivate (admin) */
  updateStatus: (id: string, isActive: boolean) =>
    api.patch(`/users/${id}/status`, { isActive }),

  /** DELETE /users/:id — Soft delete */
  remove: (id: string) => api.delete(`/users/${id}`),
};
