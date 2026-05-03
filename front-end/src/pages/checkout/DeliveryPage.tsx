import { useNavigate, Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Store } from "lucide-react";
import { shippingInfoSchema, type ShippingInfoValues, RECEIVING_METHODS } from "@/schema/checkout/shippingInfo";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/authStore";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldError } from "@/components/ui/field";

export default function DeliveryPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading, isError: cartError } = useCart();

  const user = useAuthStore((state) => state.user);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ShippingInfoValues>({
    resolver: zodResolver(shippingInfoSchema),
    defaultValues: { receivingMethod: "delivery", shippingAddress: user?.deliveryAccess ?? "" },
  });

  const receivingMethod = watch("receivingMethod");

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8"><StepIndicator step={1} /></div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-destructive font-medium">Failed to load cart</p>
        <Button className="mt-5" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="font-medium">Your cart is empty</p>
        <Button className="mt-5" nativeButton={false} render={<Link to="/products" />}>Browse products</Button>
      </div>
    );
  }

  function onSubmit(values: ShippingInfoValues) {
    void navigate({ to: "/checkout/review", search: { receivingMethod: values.receivingMethod, shippingAddress: values.shippingAddress ?? "" } });
  }

  const METHOD_CONFIG = {
    delivery: { icon: Truck, label: "Home delivery", description: "We'll deliver to your address" },
    pickup: { icon: Store, label: "Store pickup", description: "Pick up at our store" },
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
      <div className="mb-8"><StepIndicator step={1} /></div>

      <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-5">
        <div className="space-y-2">
          <Label>Receiving method</Label>
          <Controller
            control={control}
            name="receivingMethod"
            render={({ field }) => (
              <div className="space-y-2">
                {RECEIVING_METHODS.map((method) => {
                  const cfg = METHOD_CONFIG[method];
                  const selected = field.value === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => field.onChange(method)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected ? "border-primary bg-primary/5 ring-primary ring-1" : "hover:border-muted-foreground/40"}`}
                    >
                      <div className="flex items-center gap-3">
                        <cfg.icon className={`size-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="text-sm font-medium">{cfg.label}</p>
                          <p className="text-muted-foreground text-xs">{cfg.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          />
          <FieldError errors={[errors.receivingMethod]} />
        </div>

        {receivingMethod === "delivery" && (
          <div className="space-y-1.5">
            <Label htmlFor="shippingAddress">Shipping address</Label>
            <Input id="shippingAddress" placeholder="123 Nguyen Hue, District 1, Ho Chi Minh City" {...register("shippingAddress")} />
            <FieldError errors={[errors.shippingAddress]} />
          </div>
        )}

        <Button type="submit" className="w-full">Continue to review</Button>
      </form>
    </div>
  );
}
