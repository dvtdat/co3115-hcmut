import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, type BEOrder, type OrderStatus } from "@/api/services/order.api";
import { useAuthStore } from "@/store/authStore";

export type { OrderStatus };

export interface OrderItem {
  _id: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  productItem: {
    _id: string;
    image?: string;
    product?: { _id: string; name: string; image?: string };
  };
}

export interface OrderCustomer {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
}

export interface Order {
  _id: string;
  status: OrderStatus;
  receivingMethod: "delivery" | "pickup";
  totalAmount: number;
  shippingAddress?: string;
  orderDate: string;
  customer?: OrderCustomer;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

function normalizeOrder(o: BEOrder): Order {
  return {
    _id: o.id,
    status: o.orderStatus,
    receivingMethod: o.receivingMethod,
    totalAmount: o.totalAmount,
    shippingAddress: o.shippingAddress,
    orderDate: o.orderDate,
    customer: o.customer
      ? {
          _id: o.customer.id,
          fullName: o.customer.fullName ?? "",
          phone: o.customer.phone,
          email: o.customer.user?.email,
        }
      : undefined,
    items: o.orderDetails?.map((d) => ({
      _id: d.id,
      quantity: d.quantity,
      basePrice: d.basePrice,
      unitPrice: d.unitPrice,
      productItem: {
        _id: d.productItem.id,
        image: d.productItem.product?.defaultImage,
        product: d.productItem.product
          ? { _id: d.productItem.product.id, name: d.productItem.product.productName, image: d.productItem.product.defaultImage }
          : undefined,
      },
    })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function useMyOrders(params?: { pageSize?: number; pageNumber?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["orders", "me", params],
    queryFn: async () => {
      const res = await orderApi.getMyOrders(params);
      return { ...res, data: res.data.map(normalizeOrder) };
    },
    enabled: isAuthenticated,
  });
}

export function useOrders(params?: { pageSize?: number; pageNumber?: number; status?: OrderStatus }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["orders", "all", params],
    queryFn: async () => {
      const res = await orderApi.list(params);
      return { ...res, data: res.data.map(normalizeOrder) };
    },
    enabled: isAuthenticated,
  });
}

export function useOrder(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => normalizeOrder(await orderApi.getById(id)),
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
