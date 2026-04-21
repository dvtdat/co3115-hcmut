import { useMemo, useState } from "react";
import { useMockStore } from "@/mock/store";
import type { MockProduct } from "@/mock/data";

type ProductSort = "newest" | "price_asc" | "price_desc" | "top_rated" | "most_viewed";

interface UseProductsParams {
  categoryId?: string;
  sort?: ProductSort;
  pageNumber?: number;
  pageSize?: number;
}

type MutateCallbacks<TData, TInput> = {
  onSuccess?: (data: TData, variables: TInput, context?: unknown) => void;
  onError?: (error: Error, variables: TInput, context?: unknown) => void;
};

const DELAY = 300;
const delay = () => new Promise<void>((r) => setTimeout(r, DELAY));

function sortProducts(products: MockProduct[], sort?: ProductSort): MockProduct[] {
  const arr = [...products];
  switch (sort) {
    case "price_asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price_desc":
      return arr.sort((a, b) => b.price - a.price);
    case "newest":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return arr;
  }
}

export function useProductSearch(query: string) {
  const products = useMockStore((s) => s.products);
  const results = useMemo(() => {
    if (query.trim().length < 2) return null;
    const term = query.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term),
      )
      .slice(0, 3) as any[];
  }, [query, products]);
  return { data: results, isFetching: false };
}

export function useProducts(params?: UseProductsParams) {
  const products = useMockStore((s) => s.products);
  const data = useMemo(() => {
    let list = sortProducts(products, params?.sort);
    if (params?.categoryId) {
      list = list.filter((p) => p.category.id === params.categoryId);
    }
    const pageSize = params?.pageSize ?? 20;
    const pageNumber = params?.pageNumber ?? 1;
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (pageNumber - 1) * pageSize;
    const data = list.slice(start, start + pageSize) as any[];
    return { data, total, pageSize, pageNumber, totalPages };
  }, [products, params?.categoryId, params?.sort, params?.pageNumber, params?.pageSize]);
  return { data, isLoading: false, isError: false };
}

const PAGE_SIZE = 20;

export function useInfiniteProducts(params?: UseProductsParams) {
  const products = useMockStore((s) => s.products);
  const data = useMemo(() => {
    let list = sortProducts(products, params?.sort);
    if (params?.categoryId) {
      list = list.filter((p) => p.category.id === params.categoryId);
    }
    const total = list.length;
    return {
      pages: [{ data: list as any[], total, pageNumber: 1, pageSize: PAGE_SIZE, totalPages: 1 }],
      pageParams: [1],
    };
  }, [products, params?.sort, params?.categoryId]);
  return {
    data,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: () => {},
  };
}

export function useProductBySlug(slug: string) {
  const products = useMockStore((s) => s.products);
  const data = useMemo(() => (products.find((p) => p.slug === slug) ?? null) as any, [products, slug]);
  return { data, isLoading: false, isError: !data && !!slug };
}

export function useProduct(id: string) {
  const products = useMockStore((s) => s.products);
  const data = useMemo(() => (products.find((p) => p.id === id) ?? null) as any, [products, id]);
  return { data, isLoading: false, isError: false };
}

export function useCreateProduct() {
  const addProduct = useMockStore((s) => s.addProduct);
  const categories = useMockStore((s) => s.categories);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(body: {
    name: string;
    slug: string;
    price: number;
    stock: number;
    categoryId: string;
    description?: string;
    imageUrl?: string;
    keyCharacteristics?: string[];
    weight?: number;
    weightUnit?: string;
    calories?: number;
    healthScore?: number;
    shelfLife?: string;
  }) {
    setIsPending(true);
    await delay();
    const category = categories.find((c) => c.id === body.categoryId) ?? categories[0]!;
    const product = addProduct({ ...body, category, deletedAt: null, viewCount: 0 });
    setIsPending(false);
    return product;
  }

  function mutate(body: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockProduct, typeof body>) {
    void mutateAsync(body)
      .then((d) => callbacks?.onSuccess?.(d, body))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), body));
  }

  return { mutateAsync, mutate, isPending };
}

export function useUpdateProduct() {
  const editProduct = useMockStore((s) => s.editProduct);
  const categories = useMockStore((s) => s.categories);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync({ id, body }: { id: string; body: Partial<MockProduct> & { categoryId?: string } }) {
    setIsPending(true);
    await delay();
    const updates: Partial<MockProduct> = { ...body };
    if (body.categoryId) {
      updates.category = categories.find((c) => c.id === body.categoryId) ?? undefined;
    }
    const product = editProduct(id, updates);
    setIsPending(false);
    return product;
  }

  function mutate(input: Parameters<typeof mutateAsync>[0], callbacks?: MutateCallbacks<MockProduct | null, typeof input>) {
    void mutateAsync(input)
      .then((d) => callbacks?.onSuccess?.(d, input))
      .catch((e: unknown) => callbacks?.onError?.(e instanceof Error ? e : new Error(String(e)), input));
  }

  return { mutateAsync, mutate, isPending };
}

export function useDeleteProduct() {
  const removeProduct = useMockStore((s) => s.removeProduct);
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(id: string) {
    setIsPending(true);
    await delay();
    removeProduct(id);
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
