import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ImageOff, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { useMyOrders, useOrder, useCancelOrder } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// ── ViewOrderDialog ────────────────────────────────────────────────────────

interface ViewOrderDialogProps {
  orderId: string;
  onClose: () => void;
}

function ViewOrderDialog({ orderId, onClose }: ViewOrderDialogProps) {
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const canCancel = order?.status === "pending";

  async function handleCancel() {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Order cancelled successfully.");
      setConfirmCancel(false);
      onClose();
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-6 text-center">
        <p className="text-destructive text-sm">Failed to load order details.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header info */}
      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Placed on</span>
          <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums">{formatVND(order.totalAmount)}</span>
        </div>
        {order.receivingMethod && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="capitalize">{order.receivingMethod}</span>
          </div>
        )}
        {order.shippingAddress && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Address</span>
            <span className="text-right text-xs">{order.shippingAddress}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Status timeline */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
          Order Progress
        </p>
        <OrderStatusTimeline currentStatus={order.status} />
      </div>

      <Separator />

      {/* Items */}
      {(order.items?.length ?? 0) > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
            Items
          </p>
          <div className="divide-y rounded-lg border">
            {order.items?.map((item) => {
              const img = item.productItem.image ?? item.productItem.product?.image;
              const name = item.productItem.product?.name ?? "Unknown product";
              return (
                <div key={item._id} className="flex items-center gap-3 p-2.5">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
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
        </div>
      )}

      {/* Payment note */}
      {order.status === "pending" && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
          Awaiting payment. Please transfer to the bank account provided at checkout and include your order ID in the memo.
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => { setConfirmCancel(true); }}
            >
              Cancel order
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Cancel confirmation sub-dialog */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order?</DialogTitle>
            <DialogDescription>
              This cannot be undone. The order will be cancelled immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={cancelOrder.isPending}
              onClick={() => { void handleCancel(); }}
            >
              {cancelOrder.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── AccountOrdersPage ──────────────────────────────────────────────────────

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
  const [viewingId, setViewingId] = useState<string | null>(null);
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
                  <TableRow key={order._id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      #{order._id.slice(-8).toUpperCase()}
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
                        onClick={() => { setViewingId(order._id); }}
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

      {/* View order dialog */}
      <Dialog
        open={!!viewingId}
        onOpenChange={(open) => { if (!open) setViewingId(null); }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {viewingId && (
              <ViewOrderDialog
                orderId={viewingId}
                onClose={() => { setViewingId(null); }}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
