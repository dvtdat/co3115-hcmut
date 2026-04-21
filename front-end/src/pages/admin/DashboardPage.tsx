import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useUsers } from "@/hooks/use-users";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "outline",
  cancelled: "destructive",
};

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function formatDate(raw: unknown): string {
  try {
    return new Date(raw as string).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  loading?: boolean;
}

function StatCard({ label, value, icon: Icon, sub, loading }: StatCardProps) {
  return (
    <Card className="flex flex-row items-center gap-4 px-5 py-4">
      <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-primary size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-24" />
        ) : (
          <p className="text-xl font-semibold tabular-nums">{value}</p>
        )}
        {sub && !loading && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  const orders = ordersData?.data ?? [];
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const statusCounts = Object.fromEntries(
    (["pending", "confirmed", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => [
      s,
      orders.filter((o) => o.status === s).length,
    ]),
  ) as Record<OrderStatus, number>;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt as unknown as string).getTime() -
        new Date(a.createdAt as unknown as string).getTime(),
    )
    .slice(0, 5);

  const loading = ordersLoading || productsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your store</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatVND(totalRevenue)}
          icon={TrendingUp}
          sub={`From ${orders.filter((o) => o.status !== "cancelled").length} paid orders`}
          loading={ordersLoading}
        />
        <StatCard
          label="Total Orders"
          value={ordersData?.total ?? 0}
          icon={ShoppingBag}
          loading={ordersLoading}
        />
        <StatCard
          label="Products"
          value={productsData?.total ?? 0}
          icon={Package}
          loading={productsLoading}
        />
        <StatCard
          label="Customers"
          value={usersData?.total ?? 0}
          icon={Users}
          loading={usersLoading}
        />
      </div>

      {/* Status breakdown */}
      <div>
        <h2 className="mb-3 text-sm font-medium">Orders by Status</h2>
        <div className="flex flex-wrap gap-2">
          {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
            (s) => (
              <div key={s} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Badge variant={STATUS_VARIANTS[s]}>{STATUS_LABELS[s]}</Badge>
                {ordersLoading ? (
                  <Skeleton className="h-4 w-6" />
                ) : (
                  <span className="font-semibold tabular-nums">{statusCounts[s]}</span>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="mb-3 text-sm font-medium">Recent Orders</h2>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      {order.user.firstName} {order.user.lastName}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatVND(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[order.status as OrderStatus]}>
                        {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
