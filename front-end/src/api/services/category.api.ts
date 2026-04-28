/**
 * Category API service — call real backend endpoints.
 *
 * Usage in hook:
 *   import { categoryApi } from "@/api/services/category.api";
 *   const { data } = await categoryApi.list();
 */

import { api } from "@/api/fetcher";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BECategory {
  id: string;
  categoryName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  description?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const categoryApi = {
  /** GET /categories — Public, paginated */
  list: (params?: { pageSize?: number; pageNumber?: number }) =>
    api.get<Paginated<BECategory>>("/categories", params),

  /** GET /categories/:id — Public */
  getById: (id: string) => api.get<BECategory>(`/categories/${id}`),

  /** POST /categories — Admin only */
  create: (body: CreateCategoryRequest) =>
    api.post<BECategory>("/categories", body),

  /** PATCH /categories/:id — Admin only */
  update: (id: string, body: UpdateCategoryRequest) =>
    api.patch<BECategory>(`/categories/${id}`, body),

  /** DELETE /categories/:id — Admin only (soft delete) */
  remove: (id: string) => api.delete(`/categories/${id}`),
};
