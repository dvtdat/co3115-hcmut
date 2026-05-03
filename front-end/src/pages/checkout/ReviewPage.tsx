import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import type { ShippingInfoValues } from "@/schema/checkout/shippingInfo";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

interface ReviewPageProps {
  shippingInfo: ShippingInfoValues;
}

export default function ReviewPage({ shippingInfo }: ReviewPageProps) {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8"><StepIndicator step={2} /></div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="mt-4 h-52 w-full rounded-xl" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    );
  }

  async function handlePlaceOrder() {
    try {
      const order = await createOrder.mutateAsync({
        receivingMethod: shippingInfo.receivingMethod,
        shippingAddress: shippingInfo.shippingAddress || undefined,
      });
      void navigate({ to: "/checkout/payment/$orderId", params: { orderId: order.id } });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
      <div className="mb-8"><StepIndicator step={2} /></div>

      <div className="space-y-6">
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium">
            {shippingInfo.receivingMethod === "delivery" ? "Delivering to" : "Store pickup"}
          </p>
          {shippingInfo.receivingMethod === "delivery" && shippingInfo.shippingAddress && (
            <p className="text-muted-foreground mt-1 text-sm">{shippingInfo.shippingAddress}</p>
          )}
        </div>

        <div className="rounded-xl border p-4">
          <p className="mb-3 text-sm font-medium">Order items ({items.length})</p>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3 py-2.5">
                <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="size-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                      <ImageOff className="size-3 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm">{item.product.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatVND(item.product.price * item.quantity)}</p>
                    <p className="text-muted-foreground text-xs">× {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>{formatVND(total)}</span>
          </div>
        </div>

        <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Your order will be processed immediately after placement.
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { void navigate({ to: "/checkout" }); }} disabled={createOrder.isPending}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back
          </Button>
          <Button onClick={() => { void handlePlaceOrder(); }} disabled={createOrder.isPending || items.length === 0} className="flex-1">
            {createOrder.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Place order
          </Button>
        </div>
      </div>
    </div>
  );
}
