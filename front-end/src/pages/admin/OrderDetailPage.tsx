import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import type { components } from "@/api/schema.d.ts";

interface AdminOrderDetailPageProps {
  id: string;
}

type OrderStatus = components["schemas"]["Order"]["status"];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusUpdateSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    trackingNumber: z.string().optional(),
    courierName: z.string().optional(),
    estimatedDeliveryDate: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === "shipped" && !val.trackingNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trackingNumber"],
        message: "Tracking number is required when shipping",
      });
    }
  });

type StatusUpdateValues = z.infer<typeof statusUpdateSchema>;

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// ── Status Update Dialog ────────────────────────────────────────────────────

interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
  defaultTrackingNumber?: string;
  defaultCourierName?: string;
}

function StatusUpdateDialog({
  orderId,
  currentStatus,
  defaultTrackingNumber,
  defaultCourierName,
}: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const updateStatus = useUpdateOrderStatus();
  const nextOptions = NEXT_STATUSES[currentStatus];

  const form = useForm<StatusUpdateValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: nextOptions[0] ?? currentStatus,
      trackingNumber: defaultTrackingNumber ?? "",
      courierName: defaultCourierName ?? "",
      estimatedDeliveryDate: "",
      note: "",
    },
  });

  const watchedStatus = form.watch("status");
  const isShipping = watchedStatus === "shipped";

  async function onSubmit(values: StatusUpdateValues) {
    try {
      await updateStatus.mutateAsync({ id: orderId, body: values });
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
      <DialogContent className="max-h-[75dvh] sm:max-w-[60dvw]">
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

            {isShipping && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="tracking">
                    Tracking number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tracking"
                    placeholder="e.g. VN123456789"
                    {...form.register("trackingNumber")}
                  />
                  {form.formState.errors.trackingNumber && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.trackingNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="courier">Courier name</Label>
                  <Input
                    id="courier"
                    placeholder="e.g. Giao Hang Nhanh"
                    {...form.register("courierName")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="est-delivery">Estimated delivery date</Label>
                  <Input
                    id="est-delivery"
                    type="date"
                    {...form.register("estimatedDeliveryDate")}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Internal note for this transition…"
                rows={2}
                {...form.register("note")}
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
              #{order.id.slice(-8).toUpperCase()}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground text-xs">
            {format(new Date(order.createdAt as unknown as string), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <StatusUpdateDialog
          orderId={id}
          currentStatus={order.status}
          defaultTrackingNumber={order.trackingNumber}
          defaultCourierName={order.courierName}
        />
      </div>

      {/* Customer info */}
      <div className="rounded-xl border p-5">
        <h2 className="mb-3 font-medium">Customer</h2>
        <div className="space-y-1 text-sm">
          <p>
            {order.user.firstName} {order.user.lastName}
          </p>
          <p className="text-muted-foreground">{order.user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 font-medium">Items</h2>
            <div className="divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-3 py-3">
                  <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-lg">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center">
                        <ImageOff className="size-4 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm leading-snug font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.quantity} × {formatVND(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {formatVND(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
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
            {order.payment ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{order.payment.bankName ?? order.payment.bankAbbreviation ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono text-xs">{order.payment.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount received</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {formatVND(order.payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed at</span>
                  <span>{format(new Date(order.payment.confirmedAt), "MMM d, yyyy · h:mm a")}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {order.status === "cancelled"
                  ? "No payment collected."
                  : "Payment not yet confirmed."}
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 font-medium">Status history</h2>
            <OrderStatusTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
          </div>

          {/* Shipping */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-3 font-medium">Shipping</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{order.shippingAddress}</p>
            {order.notes && (
              <p className="text-muted-foreground mt-2 text-xs italic">{order.notes}</p>
            )}
            {order.trackingNumber && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-medium">Tracking</p>
                <p className="text-muted-foreground font-mono text-xs">{order.trackingNumber}</p>
                {order.courierName && (
                  <p className="text-muted-foreground text-xs">via {order.courierName}</p>
                )}
              </div>
            )}
            {order.estimatedDeliveryDate && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Est. delivery: </span>
                <span>{format(new Date(order.estimatedDeliveryDate), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
