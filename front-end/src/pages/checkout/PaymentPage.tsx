import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Clock, Copy, Loader2, WifiOff } from "lucide-react";
import { useOrderPolling, useOrderPaymentQr } from "@/hooks/use-orders";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

interface QrDisplayProps {
  qrUrl: string | undefined;
  qrLoading: boolean;
  qrError: boolean;
}

function QrDisplay({ qrUrl, qrLoading, qrError }: QrDisplayProps) {
  const [imgError, setImgError] = useState(false);

  if (qrUrl && !imgError) {
    return (
      <div className="flex justify-center">
        <img
          src={qrUrl}
          alt="VietQR payment QR code"
          className="h-52 w-52 rounded-xl object-contain"
          onError={() => {
            setImgError(true);
          }}
        />
      </div>
    );
  }

  if (qrError || (!qrLoading && !qrUrl) || imgError) {
    return (
      <div className="bg-muted flex h-52 w-full flex-col items-center justify-center gap-2 rounded-xl">
        <WifiOff className="text-muted-foreground size-6 opacity-50" />
        <p className="text-muted-foreground text-xs">
          QR code unavailable. Use the bank details below.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted flex h-52 w-full items-center justify-center rounded-xl">
      <div className="text-center">
        <Loader2 className="text-muted-foreground mx-auto mb-2 size-6 animate-spin" />
        <p className="text-muted-foreground text-xs">Loading QR code…</p>
      </div>
    </div>
  );
}

interface PaymentPageProps {
  orderId: string;
}

export default function PaymentPage({ orderId }: PaymentPageProps) {
  const navigate = useNavigate();
  const { data: order, isLoading: orderLoading, isError: orderError } = useOrderPolling(orderId);
  const { data: qr, isLoading: qrLoading, isError: qrError } = useOrderPaymentQr(orderId);

  useEffect(() => {
    if (order?.payment) {
      void navigate({ to: "/checkout/success/$orderId", params: { orderId } });
    }
  }, [order?.payment, navigate, orderId]);

  if (orderLoading || qrLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8">
          <StepIndicator step={3} />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="mt-4 h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-destructive font-medium">Failed to load order details.</p>
        <p className="text-muted-foreground mt-1 text-sm">Please refresh the page to try again.</p>
        <Button
          className="mt-5"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>

      <div className="mb-8">
        <StepIndicator step={3} />
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <Clock className="size-4 shrink-0 animate-pulse" />
          Waiting for payment confirmation…
        </div>

        <div className="rounded-2xl border p-5">
          <p className="mb-4 text-center text-sm font-medium">Scan to pay via VietQR</p>

          <QrDisplay qrUrl={qr?.qrUrl} qrLoading={qrLoading} qrError={qrError} />

          <Separator className="my-4" />

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
      </div>
    </div>
  );
}
