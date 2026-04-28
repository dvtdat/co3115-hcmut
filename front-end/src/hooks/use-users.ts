import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/services/user.api";
import { useAuthStore } from "@/store/authStore";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => userApi.getMe(),
    enabled: isAuthenticated,
  });
}

export function useUsers(params?: { pageNumber?: number; pageSize?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.list(params),
    enabled: isAuthenticated,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof userApi.update>[1] }) =>
      userApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userApi.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// Per-user order filter not supported by current API — stub
export function useUserOrders(_userId: string) {
  return { data: undefined as { data: { _id: string; status: string; totalAmount: number; createdAt: string }[] } | undefined, isLoading: false, isError: false };
}
