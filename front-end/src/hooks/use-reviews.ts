import { useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import type { MockReview } from "@/mock/data";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 300));

export function useProductReviews(productId: string) {
  const reviews = useMockStore((s) => s.reviews);
  const data = useMemo(() => {
    if (!productId) return null;
    const list = reviews.filter((r) => r.product.id === productId);
    return { data: list, total: list.length };
  }, [reviews, productId]);
  return { data, isLoading: false, isError: false };
}

export function useCreateReview() {
  const addReview = useMockStore((s) => s.addReview);
  const products = useMockStore((s) => s.products);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: {
    rating: number;
    comment: string;
    productId: string;
    userId?: string;
  }) {
    setIsPending(true);
    await delay();
    const product = products.find((p) => p.id === body.productId);
    const review = addReview({
      rating: body.rating,
      comment: body.comment,
      userId: body.userId ?? "usr_001",
      userName: "John Doe",
      productId: body.productId,
      productName: product?.name ?? "Product",
    });
    setIsPending(false);
    return review;
  }

  function mutate(body: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockReview, typeof body>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateReview() {
  const editReview = useMockStore((s) => s.editReview);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: { rating?: number; comment?: string } }) {
    setIsPending(true);
    await delay();
    const review = editReview(id, body);
    setIsPending(false);
    return review;
  }

  function mutate(
    input: { id: string; body: { rating?: number; comment?: string } },
    callbacks?: MutateCallbacks<MockReview | null, typeof input>,
  ) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useDeleteReview() {
  const removeReview = useMockStore((s) => s.removeReview);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(id: string) {
    setIsPending(true);
    await delay();
    removeReview(id);
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
