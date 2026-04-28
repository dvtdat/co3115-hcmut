import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, type BECategory } from "@/api/services/category.api";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeCategory(c: BECategory): Category {
  return { _id: c.id, name: c.categoryName, description: c.description, createdAt: c.createdAt, updatedAt: c.updatedAt };
}

export function useCategories(params?: { pageNumber?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const res = await categoryApi.list({ pageSize: params?.pageSize ?? 50, pageNumber: params?.pageNumber ?? 1 });
      return { ...res, data: res.data.map(normalizeCategory) };
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => normalizeCategory(await categoryApi.getById(id)),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof categoryApi.update>[1] }) =>
      categoryApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
