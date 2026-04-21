import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useOrders, useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageOff } from "lucide-react";
import TablePagination from "@/components/TablePagination";

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

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
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

// ── Status update form schema ─────────────────────────────────────────────

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

// ── ManageOrderDialog ──────────────────────────────────────────────────────

interface ManageOrderDialogProps {
  orderId: string;
  onClose: () => void;
}

function ManageOrderDialog({ orderId, onClose }: ManageOrderDialogProps) {
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const currentStatus = (order?.status ?? "pending") as OrderStatus;
  const nextOptions = order ? NEXT_STATUSES[currentStatus] : [];

  const form = useForm<StatusUpdateValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "confirmed",
      trackingNumber: "",
      courierName: "",
      estimatedDeliveryDate: "",
      note: "",
    },
    values: order
      ? {
          status: nextOptions[0] ?? currentStatus,
          trackingNumber: order.trackingNumber ?? "",
          courierName: order.courierName ?? "",
          estimatedDeliveryDate: "",
          note: "",
        }
      : undefined,
  });

  const watchedStatus = form.watch("status");
  const isShipping = watchedStatus === "shipped";

  async function onSubmit(values: StatusUpdateValues) {
    try {
      await updateStatus.mutateAsync({ id: orderId, body: values });
      toast.success("Order status updated.");
      onClose();
    } catch {
      toast.error("Failed to update order status.");
    }
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {/* Order summary */}
      <div className="grid gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono">{order.id.slice(-12)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Customer</span>
          <span>
            {order.user.firstName} {order.user.lastName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums">{formatVND(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={STATUS_VARIANTS[currentStatus]}>{STATUS_LABELS[currentStatus]}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Address</span>
          <span className="max-w-[200px] text-right text-xs">{order.shippingAddress}</span>
        </div>
      </div>

      {/* Order items */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Items
        </p>
        <div className="divide-y rounded-lg border">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2.5">
              <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageOff className="text-muted-foreground/40 size-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.product.name}</p>
                <p className="text-muted-foreground text-xs">
                  {item.quantity} × {formatVND(item.unitPrice)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">
                {formatVND(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Status update form */}
      {nextOptions.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          This order has reached its final status.
        </p>
      ) : (
        <form
          id="status-form"
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          className="grid gap-4"
        >
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Update Status
          </p>

          <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
                <Label htmlFor="tracking">
                  Tracking number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tracking"
                  {...form.register("trackingNumber")}
                  placeholder="e.g. VN123456789"
                />
                {form.formState.errors.trackingNumber && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.trackingNumber.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="courier">Courier name</Label>
                <Input
                  id="courier"
                  {...form.register("courierName")}
                  placeholder="e.g. Giao Hang Nhanh"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="est-delivery">Estimated delivery date</Label>
                <Input id="est-delivery" type="date" {...form.register("estimatedDeliveryDate")} />
              </div>
            </>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="status-note">Note (optional)</Label>
            <Textarea
              id="status-note"
              {...form.register("note")}
              placeholder="Internal note for this transition…"
              rows={2}
            />
          </div>
        </form>
      )}

      {/* Dialog action buttons */}
      <div className="bg-muted/50 -mx-4 -mb-4 flex justify-end gap-2 rounded-b-xl border-t px-4 py-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {nextOptions.length > 0 && (
          <Button type="submit" form="status-form" disabled={updateStatus.isPending}>
            {updateStatus.isPending ? "Updating…" : "Update status"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── AdminOrdersPage ────────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 5;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [managingId, setManagingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    pageNumber: page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleStatusFilterChange = (status: OrderStatus | "all") => {
    setStatusFilter(status);
    setPage(1);
  };

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
          onClick={() => {
            handleStatusFilterChange("all");
          }}
        >
          All
        </Button>
        {ALL_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => {
              handleStatusFilterChange(s);
            }}
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
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(-10)}</TableCell>
                  <TableCell>
                    {order.user.firstName} {order.user.lastName}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatVND(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[order.status as OrderStatus]}>
                      {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setManagingId(order.id);
                      }}
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

      {/* Manage dialog */}
      <Dialog
        open={!!managingId}
        onOpenChange={(open) => {
          if (!open) setManagingId(null);
        }}
      >
        <DialogContent className="max-h-[75dvh] sm:max-w-[60dvw]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Manage Order</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {managingId && (
              <ManageOrderDialog
                orderId={managingId}
                onClose={() => {
                  setManagingId(null);
                }}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
