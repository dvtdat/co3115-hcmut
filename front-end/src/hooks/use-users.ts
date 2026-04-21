import { useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import { useAuthStore } from "@/store/authStore";
import type { MockUser } from "@/mock/data";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 300));

export function useUsers(params?: { pageNumber?: number; pageSize?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const users = useMockStore((s) => s.users);
  const data = useMemo(() => {
    if (!isAuthenticated) return null;
    const pageSize = params?.pageSize ?? 20;
    const pageNumber = params?.pageNumber ?? 1;
    const total = users.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (pageNumber - 1) * pageSize;
    return { data: users.slice(start, start + pageSize) as any[], total, pageNumber, pageSize, totalPages };
  }, [isAuthenticated, users, params?.pageNumber, params?.pageSize]);
  return { data, isLoading: false, isError: false };
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeUser = useAuthStore((s) => s.user);
  const users = useMockStore((s) => s.users);
  const data = useMemo(() => {
    if (!isAuthenticated || !storeUser) return null;
    return (users.find((u) => u.id === storeUser.id) ?? null) as any;
  }, [isAuthenticated, storeUser, users]);
  return { data, isLoading: false, isError: false };
}

export function useUser(id: string) {
  const users = useMockStore((s) => s.users);
  const data = useMemo(() => (users.find((u) => u.id === id) ?? null) as any, [users, id]);
  return { data, isLoading: false, isError: false };
}

export function useUserByEmail(email: string) {
  const users = useMockStore((s) => s.users);
  const data = useMemo(
    () => (users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null) as any,
    [users, email],
  );
  return { data, isLoading: false, isError: false };
}

export function useUserOrders(id: string) {
  const orders = useMockStore((s) => s.orders);
  const data = useMemo(() => {
    if (!id) return null;
    const list = orders.filter((o) => o.userId === id);
    return { data: list as any[], total: list.length, pageNumber: 1, pageSize: 50, totalPages: 1 };
  }, [orders, id]);
  return { data, isLoading: false, isError: false };
}

export function useCreateUser() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_body: unknown) {
    setIsPending(true);
    await delay();
    setIsPending(false);
    return {};
  }
  function mutate(body: unknown, callbacks?: MutateCallbacks<unknown, unknown>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }
  return { mutateAsync, mutate, isPending };
}

export function useUpdateUser() {
  const editUser = useMockStore((s) => s.editUser);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({
    id,
    body,
  }: {
    id: string;
    body: { firstName?: string; lastName?: string; password?: string };
  }) {
    setIsPending(true);
    await delay();
    const user = editUser(id, body);
    setIsPending(false);
    return user;
  }

  function mutate(
    input: { id: string; body: { firstName?: string; lastName?: string; password?: string } },
    callbacks?: MutateCallbacks<MockUser | null, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useDeleteUser() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_id: string) {
    setIsPending(true);
    await delay();
    setIsPending(false);
    return {};
  }
  function mutate(id: string, callbacks?: MutateCallbacks<unknown, string>) {
    void mutateAsync(id)
      .then((d) => callbacks?.onSuccess?.(d, id))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), id));
  }
  return { mutateAsync, mutate, isPending };
}

export function useUpdateUserStatus() {
  const setUserStatus = useMockStore((s) => s.setUserStatus);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: { isActive: boolean } }) {
    setIsPending(true);
    await delay();
    setUserStatus(id, body.isActive);
    setIsPending(false);
    return { id, ...body };
  }

  function mutate(
    input: { id: string; body: { isActive: boolean } },
    callbacks?: MutateCallbacks<{ id: string; isActive: boolean }, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}
