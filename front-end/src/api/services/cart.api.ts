/**
 * Cart API service — call real backend endpoints.
 * All endpoints require JWT authentication.
 *
 * Usage in hook:
 *   import { cartApi } from "@/api/services/cart.api";
 *   const cart = await cartApi.getCart();
 */

import { api } from "@/api/fetcher";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BECartItemProduct {
  _id: string;
  productName: string;
  basePrice: number;
  stockQuantity: number;
  defaultImage?: string;
}

export interface BECartItemProductItem {
  _id: string;
  specificPrice: number;
  imageURL?: string;
  product: BECartItemProduct;
}

export interface BECartItem {
  _id: string;
  quantity: number;
  productItem: BECartItemProductItem;
  createdAt: string;
  updatedAt: string;
}

export interface BECart {
  _id: string;
  cartItems: BECartItem[];
}

// ── API ──────────────────────────────────────────────────────────────────────

export const cartApi = {
  /** GET /carts/me — Get or create cart for current user */
  getCart: () => api.get<BECart>("/carts/me"),

  /**
   * POST /carts/items — Add item to cart
   * Note: uses productItemId (NOT productId)!
   * If item already in cart, quantity is incremented.
   */
  addItem: (body: { productItemId: string; quantity: number }) =>
    api.post<BECart>("/carts/items", body),

  /**
   * PATCH /carts/items/:itemId — Update cart item quantity
   * itemId = CartItem._id (NOT productItemId)
   */
  updateItem: (cartItemId: string, body: { quantity: number }) =>
    api.patch<BECart>(`/carts/items/${cartItemId}`, body),

  /**
   * DELETE /carts/items/:itemId — Remove item from cart
   * itemId = CartItem._id
   */
  removeItem: (cartItemId: string) =>
    api.delete<BECart>(`/carts/items/${cartItemId}`),

  /** DELETE /carts — Clear all items */
  clearCart: () => api.delete<BECart>("/carts"),
};
