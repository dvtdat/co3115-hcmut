import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Copy, Loader2 } from "lucide-react";
import { useOrderPolling, useOrderPaymentQr } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderConfirmationPageProps {
  id: string;
}

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function CopyField({ label, value }: { label: string; value: string }) {
  function handleCopy() {
    void navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  return (
    <div className="bg-muted/50 flex items-center justify-between gap-4 rounded-lg px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Copy ${label}`}
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

export default function OrderConfirmationPage({ id }: OrderConfirmationPageProps) {
  const { data: order, isLoading: orderLoading } = useOrderPolling(id);
  const { data: qr, isLoading: qrLoading } = useOrderPaymentQr(id);
  const [qrImgError, setQrImgError] = useState(false);

  const isPaid = !!order?.payment;

  if (orderLoading || qrLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center sm:px-6">
        <p className="text-destructive text-sm">Order not found.</p>
        <Button className="mt-4" nativeButton={false} render={<Link to="/account/orders" />}>
          View my orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-xl font-semibold">Order placed!</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Order{" "}
        <span className="text-foreground font-mono font-medium">#{id.slice(-8).toUpperCase()}</span>{" "}
        · Total {formatVND(order.totalAmount)}
      </p>

      {isPaid ? (
        /* ── Paid state ──────────────────────────────────────────────── */
        <div className="rounded-2xl border bg-blue-50 p-6 text-center dark:bg-blue-950/20">
          <CheckCircle2 className="mx-auto mb-3 size-10 text-primary" />
          <p className="font-semibold text-primary">Payment confirmed!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            We have received your payment and are preparing your order.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button nativeButton={false} render={<Link to="/account/orders/$id" params={{ id }} />}>
              Track order
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link to="/products" />}>
              Continue shopping
            </Button>
          </div>
        </div>
      ) : (
        /* ── Pending payment ─────────────────────────────────────────── */
        <div className="space-y-5">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
            <Clock className="size-4 shrink-0 animate-pulse" />
            Waiting for payment confirmation…
          </div>

          {/* QR code */}
          <div className="rounded-2xl border p-5">
            <p className="mb-4 text-center text-sm font-medium">Scan to pay via VietQR</p>

            {qr?.qrUrl && !qrImgError ? (
              <div className="flex justify-center">
                <img
                  src={qr.qrUrl}
                  alt="VietQR payment QR code"
                  className="h-52 w-52 rounded-xl object-contain"
                  onError={() => {
                    setQrImgError(true);
                  }}
                />
              </div>
            ) : (
              <div className="bg-muted flex h-52 w-full items-center justify-center rounded-xl">
                <div className="text-center">
                  <Loader2 className="text-muted-foreground mx-auto mb-2 size-6 animate-spin" />
                  <p className="text-muted-foreground text-xs">Loading QR code…</p>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Bank details */}
            <div className="space-y-2">
              {qr?.accountNumber && <CopyField label="Account number" value={qr.accountNumber} />}
              {qr?.accountName && <CopyField label="Account name" value={qr.accountName} />}
              {qr?.amount !== undefined && (
                <CopyField label="Amount (VND)" value={String(qr.amount)} />
              )}
              {qr?.memo && <CopyField label="Transfer description" value={qr.memo} />}
            </div>

            <p className="text-muted-foreground mt-4 text-center text-xs">
              Include the exact transfer description so your payment is matched automatically.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              nativeButton={false}
              render={<Link to="/account/orders/$id" params={{ id }} />}
            >
              View order details
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              nativeButton={false}
              render={<Link to="/products" />}
            >
              Continue shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
