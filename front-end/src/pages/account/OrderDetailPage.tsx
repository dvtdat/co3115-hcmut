import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOrder, useCancelOrder } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderDetailPageProps {
  id: string;
}

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function OrderDetailPage({ id }: OrderDetailPageProps) {
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder();

  const canCancel = order?.status === "pending";

  async function handleCancel() {
    try {
      await cancelOrder.mutateAsync(id);
      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <OrderDetailSkeleton />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => void navigate({ to: "/account/orders" })}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to orders
        </Button>
        <p className="text-destructive text-sm">Order not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2"
            nativeButton={false}
            render={<Link to="/account/orders" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to orders
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-muted-foreground font-mono text-sm font-semibold">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground text-xs">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {canCancel && (
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                />
              }
            >
              Cancel order
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel order?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. The order will be cancelled immediately.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button
                  variant="destructive"
                  disabled={cancelOrder.isPending}
                  onClick={() => void handleCancel()}
                >
                  {cancelOrder.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Yes, cancel order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 font-medium">Items</h2>
            <div className="divide-y">
              {order.items?.map((item) => {
                const itemImage = item.productItem.image ?? item.productItem.product?.image;
                const itemName = item.productItem.product?.name ?? "Unknown product";
                return (
                  <div key={item._id} className="flex gap-3 py-3">
                    <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-lg">
                      {itemImage ? (
                        <img src={itemImage} alt={itemName} className="size-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground flex size-full items-center justify-center">
                          <ImageOff className="size-4 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-sm leading-snug font-medium">{itemName}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.quantity} × {formatVND(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        {formatVND(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatVND(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-3 font-medium">Payment</h2>
            <p className="text-muted-foreground text-sm">
              {order.status === "cancelled"
                ? "No payment was collected."
                : order.status === "pending"
                  ? "Awaiting payment confirmation. Please transfer to the bank account provided at checkout."
                  : "Payment confirmed."}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 font-medium">Order status</h2>
            <OrderStatusTimeline currentStatus={order.status} />
          </div>

          {/* Delivery info */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-3 font-medium">Delivery</h2>
            <p className="text-sm font-medium capitalize">{order.receivingMethod}</p>
            {order.shippingAddress && (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {order.shippingAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
