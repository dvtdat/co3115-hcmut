import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, type BECart } from "@/api/services/cart.api";
import { useAuthStore } from "@/store/authStore";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface CartItem {
  _id: string;
  quantity: number;
  product: CartProduct;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

function normalizeCart(raw: BECart): Cart {
  return {
    _id: raw.id,
    items: raw.cartItems.map((ci) => ({
      _id: ci.id,
      quantity: ci.quantity,
      product: {
        _id: ci.productItem.product.id,
        name: ci.productItem.product.productName,
        price: ci.productItem.specificPrice,
        stock: ci.productItem.product.stockQuantity,
        image: ci.productItem.imageURL ?? ci.productItem.product.defaultImage,
      },
    })),
  };
}

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => normalizeCart(await cartApi.getCart()),
    enabled: isAuthenticated,
  });
}

export function useAddCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { productItemId: string; quantity: number }) => cartApi.addItem(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, body }: { cartItemId: string; body: { quantity: number } }) =>
      cartApi.updateItem(cartItemId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeItem(cartItemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
