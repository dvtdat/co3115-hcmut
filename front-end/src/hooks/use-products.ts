import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  productApi,
  type BEProduct,
  type BEProductItem,
  type ProductSort,
} from "@/api/services/product.api";

export interface ProductItem {
  _id: string;
  price: number;
  image?: string;
  status: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  category: { _id: string; name: string; description?: string };
  items?: ProductItem[];
  createdAt: string;
  updatedAt: string;
}

function normalizeItem(item: BEProductItem): ProductItem {
  return { _id: item.id, price: item.specificPrice, image: item.imageURL, status: item.status };
}

function normalizeProduct(p: BEProduct): Product {
  return {
    _id: p.id,
    name: p.productName,
    price: p.basePrice,
    stock: p.stockQuantity,
    image: p.defaultImage,
    description: p.description,
    category: {
      _id: p.category.id,
      name: p.category.categoryName,
      description: p.category.description,
    },
    items: p.productItems?.map(normalizeItem),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

interface UseProductsParams {
  categoryId?: string;
  sort?: ProductSort;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export function useProducts(params?: UseProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await productApi.list(params);
      return { ...res, data: res.data.map(normalizeProduct) };
    },
  });
}

export function useInfiniteProducts(params?: Omit<UseProductsParams, "pageNumber">) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await productApi.list({
        ...params,
        pageNumber: pageParam as number,
        pageSize: 20,
      });
      return { ...res, data: res.data.map(normalizeProduct) };
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pageNumber < last.totalPages ? last.pageNumber + 1 : undefined,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const res = await productApi.list({ search: query, pageSize: 5 });
      return res.data.map(normalizeProduct);
    },
    enabled: query.trim().length >= 2,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => normalizeProduct(await productApi.getById(id)),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof productApi.update>[1] }) =>
      productApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateProductItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: string;
      body: Parameters<typeof productApi.createItem>[1];
    }) => productApi.createItem(productId, body),
    onSuccess: (_data, { productId }) =>
      qc.invalidateQueries({ queryKey: ["products", productId] }),
  });
}

export function useUpdateProductItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: Parameters<typeof productApi.updateItem>[1];
    }) => productApi.updateItem(itemId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProductItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => productApi.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
