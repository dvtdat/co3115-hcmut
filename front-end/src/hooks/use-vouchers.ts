import { useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import { useAuthStore } from "@/store/authStore";
import type { MockVoucher } from "@/mock/data";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 300));

export function useVouchers(params?: { pageNumber?: number; pageSize?: number }) {
  const vouchers = useMockStore((s) => s.vouchers);
  const data = useMemo(() => {
    const pageSize = params?.pageSize ?? 20;
    const pageNumber = params?.pageNumber ?? 1;
    const total = vouchers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (pageNumber - 1) * pageSize;
    return { data: vouchers.slice(start, start + pageSize) as any[], total, pageNumber, pageSize, totalPages };
  }, [vouchers, params?.pageNumber, params?.pageSize]);
  return { data, isLoading: false, isError: false };
}

export function useAvailableVouchers() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const vouchers = useMockStore((s) => s.vouchers);
  const data = useMemo(() => {
    if (!isAuthenticated) return null;
    const active = vouchers.filter((v) => v.isActive);
    return { data: active as any[], total: active.length };
  }, [isAuthenticated, vouchers]);
  return { data, isLoading: false, isError: false };
}

export function useValidateVoucher(code: string, subtotal: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const vouchers = useMockStore((s) => s.vouchers);

  const enabled = isAuthenticated && !!code && subtotal > 0;

  const result = useMemo(() => {
    if (!enabled) return null;
    const v = vouchers.find((vou) => vou.code === code.toUpperCase() && vou.isActive);
    if (!v) return null;
    if (v.minOrderAmount && subtotal < v.minOrderAmount) return null;

    let discount = 0;
    if (v.type === "percent") {
      discount = Math.floor((subtotal * v.value) / 100);
      if (v.maxDiscount) discount = Math.min(discount, v.maxDiscount);
    } else {
      discount = v.value;
    }

    return { discountAmount: Math.min(discount, subtotal) };
  }, [enabled, code, subtotal, vouchers]);

  return {
    data: result ?? undefined,
    isFetching: false,
    isError: enabled && !result,
  };
}

export function useCreateVoucher() {
  const addVoucher = useMockStore((s) => s.addVoucher);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: Omit<MockVoucher, "id" | "_id" | "usedCount" | "createdAt" | "updatedAt" | "isActive"> & { isActive?: boolean }) {
    setIsPending(true);
    await delay();
    const v = addVoucher(body);
    setIsPending(false);
    return v;
  }

  function mutate(body: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockVoucher, typeof body>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateVoucher() {
  const editVoucher = useMockStore((s) => s.editVoucher);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: Partial<MockVoucher> }) {
    setIsPending(true);
    await delay();
    const v = editVoucher(id, body);
    setIsPending(false);
    return v;
  }

  function mutate(
    input: { id: string; body: Partial<MockVoucher> },
    callbacks?: MutateCallbacks<MockVoucher | null, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useDeleteVoucher() {
  const removeVoucher = useMockStore((s) => s.removeVoucher);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(id: string) {
    setIsPending(true);
    await delay();
    removeVoucher(id);
    setIsPending(false);
    return { id };
  }

  function mutate(id: string, callbacks?: MutateCallbacks<{ id: string }, string>) {
    void mutateAsync(id)
      .then((d) => callbacks?.onSuccess?.(d, id))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), id));
  }

  return { mutateAsync, mutate, isPending };
}
