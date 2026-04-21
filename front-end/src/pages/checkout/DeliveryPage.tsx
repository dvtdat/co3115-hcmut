import { useNavigate, Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck } from "lucide-react";
import {
  shippingInfoSchema,
  type ShippingInfoValues,
  DELIVERY_OPTIONS,
  type DeliveryOption,
} from "@/schema/checkout/shippingInfo";
import { useCart } from "@/hooks/use-cart";
import { useDeliveryOptions } from "@/hooks/use-orders";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

export default function DeliveryPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading, isError: cartError } = useCart();
  const { data: deliveryOptions, isLoading: deliveryLoading } = useDeliveryOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ShippingInfoValues>({
    resolver: zodResolver(shippingInfoSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      deliveryOption: "standard",
    },
  });

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8">
          <StepIndicator step={1} />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-destructive font-medium">Failed to load cart</p>
        <p className="text-muted-foreground mt-1 text-sm">
          There was an error loading your cart. Please try again.
        </p>
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

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="font-medium">Your cart is empty</p>
        <p className="text-muted-foreground mt-1 text-sm">Add items before checking out.</p>
        <Button className="mt-5" nativeButton={false} render={<Link to="/products" />}>
          Browse products
        </Button>
      </div>
    );
  }

  const hasOutOfStock = items.some((item) => item.product.stock === 0);

  function onSubmit(values: ShippingInfoValues) {
    void navigate({
      to: "/checkout/review",
      search: {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        city: values.city,
        notes: values.notes,
        deliveryOption: values.deliveryOption,
      },
    });
  }

  const optionKeys: DeliveryOption[] = [...DELIVERY_OPTIONS];

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>

      <div className="mb-8">
        <StepIndicator step={1} />
      </div>

      {hasOutOfStock && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-xl border p-3 text-sm">
          One or more items in your cart are out of stock. Please update your cart before
          proceeding.
        </div>
      )}

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Nguyen Van A" {...register("fullName")} />
            <FieldError errors={[errors.fullName]} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" placeholder="0901234567" {...register("phone")} />
            <FieldError errors={[errors.phone]} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Street address</Label>
          <Input id="address" placeholder="123 Nguyen Hue, District 1" {...register("address")} />
          <FieldError errors={[errors.address]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">City / Province</Label>
          <Input id="city" placeholder="Ho Chi Minh City" {...register("city")} />
          <FieldError errors={[errors.city]} />
        </div>

        <div className="space-y-2">
          <Label>Delivery option</Label>
          {deliveryLoading ? (
            <div className="space-y-2">
              {optionKeys.map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <Controller
              control={control}
              name="deliveryOption"
              render={({ field }) => (
                <div className="space-y-2">
                  {optionKeys.map((key) => {
                    const opt = deliveryOptions?.[key];
                    const label = opt?.label ?? key;
                    const description = opt?.description;
                    const estimatedDays = opt?.estimatedDays;
                    const fee = opt?.fee ?? 0;
                    const selected = field.value === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          field.onChange(key);
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          selected
                            ? "border-primary bg-primary/5 ring-primary ring-1"
                            : "hover:border-muted-foreground/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <Truck
                              className={`mt-0.5 size-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              {description && (
                                <p className="text-muted-foreground text-xs">{description}</p>
                              )}
                              {estimatedDays && (
                                <p className="text-muted-foreground text-xs">{estimatedDays}</p>
                              )}
                            </div>
                          </div>
                          <p className="shrink-0 text-sm font-semibold">{formatVND(fee)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          )}
          <FieldError errors={[errors.deliveryOption]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">
            Order notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Special instructions for delivery..."
            rows={2}
            {...register("notes")}
          />
        </div>

        <Button type="submit" className="w-full" disabled={hasOutOfStock}>
          Continue to review
        </Button>
      </form>
    </div>
  );
}
