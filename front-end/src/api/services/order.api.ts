/**
 * Order API service — call real backend endpoints.
 * All endpoints require JWT authentication.
 *
 * Usage in hook:
 *   import { orderApi } from "@/api/services/order.api";
 *   const order = await orderApi.create({ receivingMethod: "delivery" });
 */

import { api } from "@/api/fetcher";

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
export type ReceivingMethod = "delivery" | "pickup";

export interface BEOrderDetailProductItem {
  id: string;
  specificPrice: number;
  product: {
    id: string;
    productName: string;
    defaultImage?: string;
    basePrice: number;
  };
}

export interface BEOrderDetail {
  id: string;
  basePrice: number;    // Product.basePrice at time of order
  unitPrice: number;    // ProductItem.specificPrice at time of order
  quantity: number;
  productItem: BEOrderDetailProductItem;
}

export interface BEOrderCustomer {
  id: string;
  fullName?: string;
  phone?: string;
  user?: { id: string; email: string };
}

export interface BEOrder {
  id: string;
  orderDate: string;
  receivingMethod: ReceivingMethod;
  orderStatus: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  customer?: BEOrderCustomer;
  orderDetails?: BEOrderDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  receivingMethod: ReceivingMethod;  // "delivery" | "pickup"
  shippingAddress?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

// ── API ──────────────────────────────────────────────────────────────────────

export const orderApi = {
  /**
   * POST /orders — Create order from current cart
   * Converts CartItems → OrderDetails, deducts stock, clears cart.
   */
  create: (body: CreateOrderRequest) => api.post<BEOrder>("/orders", body),

  /** GET /orders/me — List current user's orders */
  getMyOrders: (params?: { pageSize?: number; pageNumber?: number }) =>
    api.get<Paginated<BEOrder>>("/orders/me", params),

  /** GET /orders — List all orders (admin), filterable by status */
  list: (params?: {
    pageSize?: number;
    pageNumber?: number;
    status?: OrderStatus;
  }) => api.get<Paginated<BEOrder>>("/orders", params),

  /** GET /orders/:id — Get order detail */
  getById: (id: string) => api.get<BEOrder>(`/orders/${id}`),

  /**
   * DELETE /orders/:id — Cancel order
   * Only PENDING orders can be cancelled.
   * Stock is automatically restored.
   */
  cancel: (id: string) => api.delete<BEOrder>(`/orders/${id}`),

  /** PATCH /orders/:id/status — Update status (admin) */
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<BEOrder>(`/orders/${id}/status`, { status }),
};
