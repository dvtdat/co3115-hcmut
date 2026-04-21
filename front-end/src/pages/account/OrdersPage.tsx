import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Package } from "lucide-react";
import { useMyOrders } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="py-16 text-center">
      <Package className="text-muted-foreground/30 mx-auto size-10" />
      <p className="mt-3 font-medium">No orders yet</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Your orders will appear here once you place one.
      </p>
      <Button className="mt-5" size="sm" nativeButton={false} render={<Link to="/products" />}>
        Start shopping
      </Button>
    </div>
  );
}

export default function AccountOrdersPage() {
  const { data: ordersResponse, isLoading, isError } = useMyOrders();
  const orders = ordersResponse?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">Track and manage your orders.</p>
      </div>

      {isLoading && <OrdersSkeleton />}

      {isError && (
        <p className="text-destructive text-sm">Failed to load orders. Please try again.</p>
      )}

      {!isLoading && !isError && (
        <>
          {!orders?.length ? (
            <EmptyOrders />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      #{order.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(order.createdAt as unknown as string), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatVND(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link to="/account/orders/$id" params={{ id: order.id }} />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
