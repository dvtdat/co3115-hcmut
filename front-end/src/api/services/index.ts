/**
 * Barrel export for all API services.
 *
 * Usage:
 *   import { authApi, productApi, cartApi, orderApi } from "@/api/services";
 */

export { authApi } from "./auth.api";
export { userApi } from "./user.api";
export { categoryApi } from "./category.api";
export { productApi } from "./product.api";
export { cartApi } from "./cart.api";
export { orderApi } from "./order.api";

// Re-export all types for convenience
export type { LoginRequest, LoginResponse, RefreshResponse } from "./auth.api";
export type { BEUser, BECustomer, RegisterRequest, UpdateUserRequest } from "./user.api";
export type { BECategory, CreateCategoryRequest, UpdateCategoryRequest } from "./category.api";
export type {
  BEProduct, BEProductItem, CreateProductRequest, UpdateProductRequest,
  CreateProductItemRequest, UpdateProductItemRequest, ProductSort,
} from "./product.api";
export type { BECart, BECartItem, BECartItemProductItem } from "./cart.api";
export type {
  BEOrder, BEOrderDetail, BEOrderCustomer, CreateOrderRequest,
  OrderStatus, ReceivingMethod,
} from "./order.api";
export type { Paginated } from "./product.api";
