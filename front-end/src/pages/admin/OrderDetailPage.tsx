import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import type { OrderStatus } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminOrderDetailPageProps {
  id: string;
}

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]),
});

type StatusUpdateValues = z.infer<typeof statusUpdateSchema>;

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// ── Status Update Dialog ────────────────────────────────────────────────────

interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
}

function StatusUpdateDialog({ orderId, currentStatus }: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const updateStatus = useUpdateOrderStatus();
  const nextOptions = NEXT_STATUSES[currentStatus];

  const form = useForm<StatusUpdateValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: { status: nextOptions[0] ?? currentStatus },
  });

  async function onSubmit(values: StatusUpdateValues) {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: values.status });
      toast.success("Order status updated.");
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to update order status.");
    }
  }

  if (nextOptions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Update status</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            id="status-update-form"
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>New status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} items={STATUS_LABELS}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nextOptions.map((s) => (
                        <SelectItem key={s} value={s} label={STATUS_LABELS[s]}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter showCloseButton>
          <Button type="submit" form="status-update-form" disabled={updateStatus.isPending}>
            {updateStatus.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirm update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── AdminOrderDetailPage ────────────────────────────────────────────────────

export default function AdminOrderDetailPage({ id }: AdminOrderDetailPageProps) {
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => void navigate({ to: "/admin/orders" })}>
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2"
            nativeButton={false}
            render={<Link to="/admin/orders" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to orders
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-muted-foreground font-mono text-sm font-semibold">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground text-xs">
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <StatusUpdateDialog orderId={id} currentStatus={order.status} />
      </div>

      {/* Customer info */}
      <div className="rounded-xl border p-5">
        <h2 className="mb-3 font-medium">Customer</h2>
        <div className="space-y-1 text-sm">
          {order.customer?.fullName && <p>{order.customer.fullName}</p>}
          {order.customer?.email && (
            <p className="text-muted-foreground">{order.customer.email}</p>
          )}
          {order.customer?.phone && (
            <p className="text-muted-foreground">{order.customer.phone}</p>
          )}
        </div>
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
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatVND(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-3 font-medium">Payment</h2>
            <p className="text-muted-foreground text-sm">
              {order.status === "cancelled"
                ? "No payment collected."
                : order.status === "pending"
                  ? "Payment not yet confirmed. Set status to Confirmed once payment is received."
                  : "Payment confirmed."}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 font-medium">Status history</h2>
            <OrderStatusTimeline currentStatus={order.status} />
          </div>

          {/* Delivery */}
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
