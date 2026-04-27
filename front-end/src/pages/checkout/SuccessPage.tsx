import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  orderId: string;
}

export default function SuccessPage({ orderId }: SuccessPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Order complete!</h1>

      <div className="mb-8">
        <StepIndicator step={4} />
      </div>

      <div className="rounded-2xl border bg-blue-50 p-6 text-center dark:bg-blue-950/20">
        <CheckCircle2 className="mx-auto mb-3 size-12 text-primary" />
        <h2 className="text-lg font-bold text-primary">Payment confirmed!</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          We have received your payment for order{" "}
          <span className="text-foreground font-mono font-medium">
            #{orderId.slice(-8).toUpperCase()}
          </span>
          . We are now preparing your order for delivery.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to="/account/orders/$id" params={{ id: orderId }} />}
          >
            <ShoppingBag className="mr-2 size-4" />
            Track my order
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link to="/products" />}>
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
