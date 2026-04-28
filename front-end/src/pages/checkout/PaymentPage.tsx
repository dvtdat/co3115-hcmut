import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, CheckCircle2, ShoppingBag } from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const BANK_ACCOUNT = "0123456789";
const BANK_NAME = "Vietcombank";
const ACCOUNT_NAME = "CONG TY TNHH CO3115 HCMUT";

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
      <Button variant="ghost" size="icon-sm" aria-label={`Copy ${label}`} onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

interface PaymentPageProps {
  orderId: string;
}

export default function PaymentPage({ orderId }: PaymentPageProps) {
  const { data: order, isLoading } = useOrder(orderId);
  const memo = `THANHTOAN ${orderId}`;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8"><StepIndicator step={3} /></div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
      <div className="mb-8"><StepIndicator step={3} /></div>

      <div className="space-y-6">
        <div className="rounded-2xl border p-6">
          <div className="mb-4 flex items-center gap-3">
            <CheckCircle2 className="text-primary size-6 shrink-0" />
            <div>
              <p className="font-semibold">Order placed!</p>
              <p className="text-muted-foreground text-xs font-mono">#{orderId.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-4 text-sm">
            Please complete payment via bank transfer. Your order will be confirmed once payment is received.
          </p>

          <div className="space-y-2">
            <CopyField label="Bank" value={BANK_NAME} />
            <CopyField label="Account number" value={BANK_ACCOUNT} />
            <CopyField label="Account name" value={ACCOUNT_NAME} />
            <CopyField label="Amount" value={order ? formatVND(order.totalAmount) : "—"} />
            <CopyField label="Transfer memo" value={memo} />
          </div>

          <Separator className="my-4" />

          <p className="text-muted-foreground text-xs">
            Include the exact memo <span className="text-foreground font-mono font-medium">{memo}</span> in your transfer so we can match your payment.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button nativeButton={false} render={<Link to="/account/orders/$id" params={{ id: orderId }} />}>
            <ShoppingBag className="mr-2 size-4" />
            View my order
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link to="/products" />}>
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
