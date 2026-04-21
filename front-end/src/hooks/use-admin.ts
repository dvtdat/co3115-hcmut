import { useMemo } from "react";
import { useMockStore } from "@/mock/store";

export function useAdminStats() {
  const orders = useMockStore((s) => s.orders);
  const products = useMockStore((s) => s.products);
  const users = useMockStore((s) => s.users);
  const reviews = useMockStore((s) => s.reviews);
  const categories = useMockStore((s) => s.categories);

  const data = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const revenue = paidOrders
        .filter((o) => o.createdAt.startsWith(key))
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return { date: key, revenue };
    });

    const productCountPerCategory = categories.reduce<Record<string, number>>((acc, c) => {
      acc[c.name] = products.filter((p) => p.category.id === c.id).length;
      return acc;
    }, {});

    const revenuePerCategory = categories.reduce<Record<string, number>>((acc, c) => {
      const catProducts = products.filter((p) => p.category.id === c.id);
      acc[c.name] = orders
        .flatMap((o) => o.items)
        .filter((item) => catProducts.some((p) => p.id === item.product.id))
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      return acc;
    }, {});

    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const lowStockList = products.filter((p) => p.stock > 0 && p.stock <= 5);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      orders: {
        byStatus,
        totalRevenue,
        avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        todayCount: orders.filter((o) => o.createdAt.startsWith(now.toISOString().slice(0, 10))).length,
        weekCount: orders.filter((o) => new Date(o.createdAt) >= weekAgo).length,
        monthCount: orders.filter((o) => new Date(o.createdAt) >= monthAgo).length,
        revenueByDay,
        lastOrders: [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
      },
      products: {
        total: products.length,
        outOfStockCount,
        lowStockList,
        topByUnitsSold: products.slice(0, 5),
        topByRevenue: products.slice(0, 5),
        topByViews: products.slice(0, 5),
      },
      users: {
        total: users.length,
        newThisWeek: users.filter((u) => new Date(u.createdAt) >= weekAgo).length,
        newThisMonth: users.filter((u) => new Date(u.createdAt) >= monthAgo).length,
      },
      reviews: {
        total: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      categories: {
        productCountPerCategory,
        revenuePerCategory,
      },
    };
  }, [orders, products, users, reviews, categories]);

  return { data, isLoading: false, isError: false };
}
