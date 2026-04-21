import { useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import type { MockCategory } from "@/mock/data";

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const delay = () => new Promise<void>((r) => setTimeout(r, 300));

export function useCategories(params?: { pageNumber?: number; pageSize?: number }) {
  const categories = useMockStore((s) => s.categories);
  const data = useMemo(() => {
    const pageSize = params?.pageSize ?? 50;
    const pageNumber = params?.pageNumber ?? 1;
    const total = categories.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (pageNumber - 1) * pageSize;
    return { data: categories.slice(start, start + pageSize) as any[], total, pageNumber, pageSize, totalPages };
  }, [categories, params?.pageNumber, params?.pageSize]);
  return { data, isLoading: false, isError: false };
}

export function useCategoryBySlug(slug: string) {
  const categories = useMockStore((s) => s.categories);
  const data = useMemo(() => (categories.find((c) => c.slug === slug) ?? null) as any, [categories, slug]);
  return { data, isLoading: false, isError: false };
}

export function useCategory(id: string) {
  const categories = useMockStore((s) => s.categories);
  const data = useMemo(() => (categories.find((c) => c.id === id) ?? null) as any, [categories, id]);
  return { data, isLoading: false, isError: false };
}

export function useCreateCategory() {
  const addCategory = useMockStore((s) => s.addCategory);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: { name: string; slug: string; description?: string; imageUrl?: string }) {
    setIsPending(true);
    await delay();
    const cat = addCategory(body);
    setIsPending(false);
    return cat;
  }

  function mutate(body: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockCategory, typeof body>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateCategory() {
  const editCategory = useMockStore((s) => s.editCategory);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: { name?: string; slug?: string; description?: string; imageUrl?: string } }) {
    setIsPending(true);
    await delay();
    const cat = editCategory(id, body);
    setIsPending(false);
    return cat;
  }

  function mutate(input: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockCategory | null, typeof input>) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useDeleteCategory() {
  const removeCategory = useMockStore((s) => s.removeCategory);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(id: string) {
    setIsPending(true);
    await delay();
    removeCategory(id);
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
