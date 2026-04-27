/**
 * Product API service — call real backend endpoints.
 *
 * Usage in hook:
 *   import { productApi } from "@/api/services/product.api";
 *   const { data, total } = await productApi.list({ search: "macbook" });
 */

import { api } from "@/api/fetcher";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BECategory {
  _id: string;
  categoryName: string;
  description?: string;
}

export interface BEProductItem {
  _id: string;
  specificPrice: number;
  imageURL?: string;
  status: "available" | "reserved" | "sold";
  product?: string; // ObjectId ref
}

export interface BEProduct {
  _id: string;
  productName: string;
  description?: string;
  basePrice: number;
  stockQuantity: number;
  defaultImage?: string;
  category: BECategory;
  productItems?: BEProductItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateProductRequest {
  productName: string;
  basePrice: number;         // @Min(0)
  stockQuantity: number;     // @Min(0)
  categoryId: string;
  description?: string;
  defaultImage?: string;
}

export interface UpdateProductRequest {
  productName?: string;
  basePrice?: number;
  stockQuantity?: number;
  categoryId?: string;
  description?: string;
  defaultImage?: string;
}

export interface CreateProductItemRequest {
  specificPrice: number;
  imageURL?: string;
  status?: "available" | "reserved" | "sold";
}

export interface UpdateProductItemRequest {
  specificPrice?: number;
  imageURL?: string;
  status?: "available" | "reserved" | "sold";
}

export interface Paginated<T> {
  data: T[];
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

export type ProductSort = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";

// ── API ──────────────────────────────────────────────────────────────────────

export const productApi = {
  /**
   * GET /products — Public, paginated
   * Supports: search, categoryId, sort (price_asc|price_desc|name_asc|name_desc|newest)
   */
  list: (params?: {
    pageSize?: number;
    pageNumber?: number;
    categoryId?: string;
    search?: string;
    sort?: ProductSort;
  }) => api.get<Paginated<BEProduct>>("/products", params),

  /** GET /products/:id — Public, includes productItems[] */
  getById: (id: string) => api.get<BEProduct>(`/products/${id}`),

  /** POST /products — Admin only */
  create: (body: CreateProductRequest) => api.post<BEProduct>("/products", body),

  /** PATCH /products/:id — Admin only */
  update: (id: string, body: UpdateProductRequest) =>
    api.patch<BEProduct>(`/products/${id}`, body),

  /** DELETE /products/:id — Admin only (soft delete) */
  remove: (id: string) => api.delete(`/products/${id}`),

  // ─── ProductItem sub-endpoints ──────────────────────

  /** GET /products/:id/items — Available items for a product */
  listItems: (productId: string) =>
    api.get<BEProductItem[]>(`/products/${productId}/items`),

  /** POST /products/:id/items — Admin only */
  createItem: (productId: string, body: CreateProductItemRequest) =>
    api.post<BEProductItem>(`/products/${productId}/items`, body),

  /** PATCH /products/items/:itemId — Admin only */
  updateItem: (itemId: string, body: UpdateProductItemRequest) =>
    api.patch<BEProductItem>(`/products/items/${itemId}`, body),

  /** DELETE /products/items/:itemId — Admin only */
  removeItem: (itemId: string) => api.delete(`/products/items/${itemId}`),
};
