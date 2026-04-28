import { useState } from "react";
import { toast } from "sonner";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import type { Order, OrderStatus } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageOff, Loader2 } from "lucide-react";
import TablePagination from "@/components/TablePagination";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  shipping: "default",
  delivered: "outline",
  cancelled: "destructive",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
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

// ── ManageOrderDialog ──────────────────────────────────────────────────────

interface ManageOrderDialogProps {
  order: Order;
  onClose: () => void;
}

function ManageOrderDialog({ order, onClose }: ManageOrderDialogProps) {
  const updateStatus = useUpdateOrderStatus();
  const nextOptions = NEXT_STATUSES[order.status];

  async function handleStatusUpdate(status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ id: order._id, status });
      toast.success(`Order marked as ${STATUS_LABELS[status].toLowerCase()}.`);
      onClose();
    } catch {
      toast.error("Failed to update order status.");
    }
  }

  const items = order.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono text-xs">{order._id.slice(-12)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Customer</span>
          <span className="truncate max-w-[200px] text-right">
            {order.customer?.fullName ?? order.customer?.email ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
        </div>
        {order.shippingAddress && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Address</span>
            <span className="text-right text-xs">{order.shippingAddress}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Items */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Items</p>
          <div className="divide-y rounded-lg border">
            {items.map((item) => {
              const img = item.productItem.image ?? item.productItem.product?.image;
              const name = item.productItem.product?.name ?? "Unknown product";
              return (
                <div key={item._id} className="flex items-center gap-3 p-2.5">
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
                    {img ? (
                      <img src={img} alt={name} className="size-full object-cover" />
                    ) : (
                      <ImageOff className="text-muted-foreground/40 size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.quantity} × {formatVND(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatVND(item.quantity * item.unitPrice)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-1 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatVND(order.totalAmount)}</span>
          </div>
        </div>
      )}

      <Separator />

      {/* Status actions */}
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Update Status
        </p>
        {nextOptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">This order has reached its final status.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nextOptions.map((s) => (
              <Button
                key={s}
                variant={s === "cancelled" ? "destructive" : "default"}
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() => { void handleStatusUpdate(s); }}
              >
                {updateStatus.isPending && updateStatus.variables?.status === s && (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                )}
                Mark as {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose} disabled={updateStatus.isPending}>
          Close
        </Button>
      </div>
    </div>
  );
}

// ── AdminOrdersPage ────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [managingOrder, setManagingOrder] = useState<Order | null>(null);

  const { data, isLoading, isError } = useOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    pageNumber: page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleStatusFilterChange(status: OrderStatus | "all") {
    setStatusFilter(status);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-muted-foreground text-sm">View and manage customer orders</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => { handleStatusFilterChange("all"); }}
        >
          All
        </Button>
        {ALL_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => { handleStatusFilterChange(s); }}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load orders. Please try again.</p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-xs">{order._id.slice(-10)}</TableCell>
                  <TableCell>{order.customer?.fullName ?? order.customer?.email ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{formatVND(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setManagingOrder(order); }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog
        open={!!managingOrder}
        onOpenChange={(open) => { if (!open) setManagingOrder(null); }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Order</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {managingOrder && (
              <ManageOrderDialog
                order={managingOrder}
                onClose={() => { setManagingOrder(null); }}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
