import { useState } from "react";
import { useMockStore } from "@/mock/store";
import { useAuthStore } from "@/store/authStore";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 300));

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cart = useMockStore((s) => s.cart);
  return {
    data: (isAuthenticated ? cart : null) as any,
    isLoading: false,
    isError: false,
  };
}

export function useAddCartItem() {
  const addCartItem = useMockStore((s) => s.addCartItem);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: { productId: string; quantity: number }) {
    setIsPending(true);
    await delay();
    addCartItem(body.productId, body.quantity);
    setIsPending(false);
    return body;
  }

  function mutate(
    body: { productId: string; quantity: number },
    callbacks?: MutateCallbacks<typeof body, typeof body>,
  ) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateCartItem() {
  const updateCartItem = useMockStore((s) => s.updateCartItem);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ productId, body }: { productId: string; body: { quantity: number } }) {
    setIsPending(true);
    await delay();
    updateCartItem(productId, body.quantity);
    setIsPending(false);
    return { productId, ...body };
  }

  function mutate(
    input: { productId: string; body: { quantity: number } },
    callbacks?: MutateCallbacks<{ productId: string; quantity: number }, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useRemoveCartItem() {
  const removeCartItem = useMockStore((s) => s.removeCartItem);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(productId: string) {
    setIsPending(true);
    await delay();
    removeCartItem(productId);
    setIsPending(false);
    return { productId };
  }

  function mutate(productId: string, callbacks?: MutateCallbacks<{ productId: string }, string>) {
    void mutateAsync(productId)
      .then((d) => callbacks?.onSuccess?.(d, productId))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), productId));
  }

  return { mutateAsync, mutate, isPending };
}

export function useClearCart() {
  const clearCart = useMockStore((s) => s.clearCart);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync() {
    setIsPending(true);
    await delay();
    clearCart();
    setIsPending(false);
    return {};
  }

  function mutate(callbacks?: MutateCallbacks<Record<string, never>, undefined>) {
    void mutateAsync()
      .then((d) => callbacks?.onSuccess?.(d as Record<string, never>, undefined))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), undefined));
  }

  return { mutateAsync, mutate, isPending };
}
