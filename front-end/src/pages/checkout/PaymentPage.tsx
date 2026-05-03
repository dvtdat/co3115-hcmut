import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";



interface PaymentPageProps {
  orderId: string;
}

export default function PaymentPage({ orderId }: PaymentPageProps) {
  const { isLoading } = useOrder(orderId);

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
            Your order has been placed successfully. We will process it shortly.
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
