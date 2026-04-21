import { useEffect, useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import { useAuthStore } from "@/store/authStore";
import type { MockOrder } from "@/mock/data";
import { DELIVERY_OPTIONS } from "@/mock/data";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 350));

export function useDeliveryOptions() {
  return { data: DELIVERY_OPTIONS, isLoading: false, isError: false };
}

export function useOrders(params?: {
  status?: string;
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const orders = useMockStore((s) => s.orders);
  const data = useMemo(() => {
    if (!isAuthenticated) return null;
    let list = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (params?.status) list = list.filter((o) => o.status === params.status);
    if (params?.userId) list = list.filter((o) => o.userId === params.userId);
    const pageSize = params?.pageSize ?? 20;
    const pageNumber = params?.pageNumber ?? 1;
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (pageNumber - 1) * pageSize;
    return { data: list.slice(start, start + pageSize) as any[], total, pageNumber, pageSize, totalPages };
  }, [isAuthenticated, orders, params?.status, params?.userId, params?.pageNumber, params?.pageSize]);
  return { data, isLoading: false, isError: false };
}

export function useMyOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const orders = useMockStore((s) => s.orders);
  const data = useMemo(() => {
    if (!isAuthenticated || !currentUser) return null;
    const list = [...orders]
      .filter((o) => o.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: list as any[], total: list.length, pageNumber: 1, pageSize: 50, totalPages: 1 };
  }, [isAuthenticated, currentUser, orders]);
  return { data, isLoading: false, isError: false };
}

export function useOrder(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const orders = useMockStore((s) => s.orders);
  const data = useMemo(() => (orders.find((o) => o.id === id) ?? null) as any, [orders, id]);
  return { data, isLoading: false, isError: isAuthenticated && !!id && !data };
}

export function useOrderPaymentQr(id: string) {
  const orders = useMockStore((s) => s.orders);
  const order = useMemo(() => orders.find((o) => o.id === id) ?? null, [orders, id]);
  const data = order
    ? {
        qrUrl: undefined,
        accountNumber: "0123456789",
        accountName: "CONG TY TNHH CO3115 HCMUT",
        amount: order.totalAmount,
        memo: `THANHTOAN ${id}`,
      }
    : null;
  return { data, isLoading: false, isError: false };
}

export function useOrderPolling(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const orders = useMockStore((s) => s.orders);
  const confirmOrderPayment = useMockStore((s) => s.confirmOrderPayment);

  // Auto-confirm payment after 3 seconds for demo purposes
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const order = orders.find((o) => o.id === id);
    if (!order || order.payment) return;
    const timer = setTimeout(() => {
      confirmOrderPayment(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, isAuthenticated, orders, confirmOrderPayment]);

  const data = useMemo(() => (orders.find((o) => o.id === id) ?? null) as any, [orders, id]);
  return { data, isLoading: false, isError: isAuthenticated && !!id && !data };
}

export function useCreateOrder() {
  const placeOrder = useMockStore((s) => s.placeOrder);
  const currentUser = useAuthStore((s) => s.user);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: {
    shippingAddress: string;
    deliveryOption: string;
    voucherCode?: string;
    notes?: string;
  }) {
    setIsPending(true);
    await delay();
    if (!currentUser) throw new Error("Not authenticated");
    const order = placeOrder({
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      },
      ...body,
    });
    setIsPending(false);
    return order;
  }

  function mutate(body: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockOrder, typeof body>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useCancelOrder() {
  const setOrderStatus = useMockStore((s) => s.setOrderStatus);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(id: string) {
    setIsPending(true);
    await delay();
    const order = setOrderStatus(id, "cancelled");
    setIsPending(false);
    return order;
  }

  function mutate(id: string, callbacks?: MutateCallbacks<MockOrder | null, string>) {
    void mutateAsync(id)
      .then((d) => callbacks?.onSuccess?.(d, id))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), id));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateOrderStatus() {
  const setOrderStatus = useMockStore((s) => s.setOrderStatus);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: { status: MockOrder["status"] } }) {
    setIsPending(true);
    await delay();
    const order = setOrderStatus(id, body.status);
    setIsPending(false);
    return order;
  }

  function mutate(
    input: { id: string; body: { status: MockOrder["status"] } },
    callbacks?: MutateCallbacks<MockOrder | null, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}
