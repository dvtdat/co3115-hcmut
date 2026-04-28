import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/api/services/order.api";
import { productApi } from "@/api/services/product.api";
import { userApi } from "@/api/services/user.api";
import { useAuthStore } from "@/store/authStore";

export function useAdminStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderApi.list({ pageSize: 1 }),
        productApi.list({ pageSize: 1 }),
        userApi.list({ pageSize: 1 }),
      ]);
      return {
        totalOrders: ordersRes.total,
        totalProducts: productsRes.total,
        totalUsers: usersRes.total,
      };
    },
    enabled: isAuthenticated,
  });
}
