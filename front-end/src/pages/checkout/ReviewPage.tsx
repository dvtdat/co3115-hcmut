import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ImageOff, Loader2, Tag, X } from "lucide-react";
import type { ShippingInfoValues } from "@/schema/checkout/shippingInfo";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, useDeliveryOptions } from "@/hooks/use-orders";
import { useAvailableVouchers, useValidateVoucher } from "@/hooks/use-vouchers";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

interface ReviewPageProps {
  shippingInfo: ShippingInfoValues;
}

export default function ReviewPage({ shippingInfo }: ReviewPageProps) {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: deliveryOptions } = useDeliveryOptions();
  const { data: vouchersData } = useAvailableVouchers();
  const createOrder = useCreateOrder();

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const selectedDelivery = deliveryOptions?.[shippingInfo.deliveryOption];
  const deliveryFee = selectedDelivery?.fee ?? 0;

  const {
    data: voucherPreview,
    isFetching: validating,
    isError: voucherError,
  } = useValidateVoucher(appliedCode ?? "", subtotal);

  const discountAmount = appliedCode && voucherPreview ? (voucherPreview.discountAmount ?? 0) : 0;
  const total = subtotal + deliveryFee - discountAmount;

  const availableVouchers = vouchersData?.data?.filter((v) => Boolean(v.isActive as unknown)) ?? [];

  function handleApplyCode() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setAppliedCode(code);
  }

  function handleClearVoucher() {
    setAppliedCode(null);
    setVoucherInput("");
  }

  function handleSelectVoucher(code: string) {
    setAppliedCode(code);
    setVoucherInput(code);
  }

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8">
          <StepIndicator step={2} />
        </div>
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
    const shippingAddress = `${shippingInfo.fullName} - ${shippingInfo.phone} - ${shippingInfo.address}, ${shippingInfo.city}`;
    try {
      const order = await createOrder.mutateAsync({
        shippingAddress,
        deliveryOption: shippingInfo.deliveryOption,
        voucherCode: appliedCode ?? undefined,
        notes: shippingInfo.notes ?? undefined,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- schema uses _id but router needs string id
      const orderId = (order as any)._id ?? (order as any).id;
      if (orderId) {
        void navigate({ to: "/checkout/payment/$orderId", params: { orderId } });
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Checkout</h1>

      <div className="mb-8">
        <StepIndicator step={2} />
      </div>

      <div className="space-y-6">
        {/* Delivery address + option */}
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium">Delivering to</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {shippingInfo.fullName} · {shippingInfo.phone}
          </p>
          <p className="text-muted-foreground text-sm">
            {shippingInfo.address}, {shippingInfo.city}
          </p>
          {shippingInfo.notes && (
            <p className="text-muted-foreground mt-1 text-xs italic">Note: {shippingInfo.notes}</p>
          )}
          {selectedDelivery && (
            <p className="text-muted-foreground mt-2 text-xs">
              Delivery:{" "}
              <span className="font-medium">
                {selectedDelivery.label ?? shippingInfo.deliveryOption}
              </span>
              {selectedDelivery.estimatedDays && ` · ${selectedDelivery.estimatedDays}`}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="rounded-xl border p-4">
          <p className="mb-3 text-sm font-medium">Order items</p>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3 py-2.5">
                <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                      <ImageOff className="size-3 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm">{item.product.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatVND(item.product.price * item.quantity)}
                    </p>
                    <p className="text-muted-foreground text-xs">× {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Cost breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Delivery ({selectedDelivery?.label ?? shippingInfo.deliveryOption})</span>
              <span>{formatVND(deliveryFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Voucher ({appliedCode})</span>
                <span>−{formatVND(discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
        </div>

        {/* Voucher section */}
        <div className="rounded-xl border p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Tag className="size-3.5" />
            Voucher
          </p>

          {/* Available vouchers */}
          {availableVouchers.length > 0 && !appliedCode && (
            <div className="mb-3 flex flex-wrap gap-2">
              {availableVouchers.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => {
                    handleSelectVoucher(v.code);
                  }}
                  className="hover:border-primary hover:text-primary rounded-lg border border-dashed px-3 py-1.5 text-xs transition-colors"
                >
                  <span className="font-mono font-semibold">{v.code}</span>
                  <span className="text-muted-foreground ml-1.5">
                    {v.type === "percent" ? `${v.value}% off` : `−${formatVND(v.value)}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Applied badge */}
          {appliedCode && voucherPreview && !voucherError && (
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 text-primary">
                <Tag className="size-3" />
                {appliedCode} applied · −{formatVND(discountAmount)}
              </Badge>
              <button
                type="button"
                onClick={handleClearVoucher}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {appliedCode && voucherError && (
            <p className="text-destructive mb-3 text-xs">
              Invalid or inapplicable voucher code. Please check and try again.
            </p>
          )}

          {/* Manual input */}
          {!appliedCode && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter voucher code"
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value.toUpperCase());
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCode();
                  }
                }}
                className="font-mono text-sm uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCode}
                disabled={!voucherInput.trim() || validating}
              >
                {validating ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}

          {appliedCode && (
            <button
              type="button"
              onClick={handleClearVoucher}
              className="text-muted-foreground hover:text-foreground mt-2 text-xs underline"
            >
              Use a different code
            </button>
          )}
        </div>

        {/* Payment note */}
        <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Payment via bank transfer (VietQR). You will receive QR code and bank details on the next
          screen after placing your order.
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              void navigate({ to: "/checkout" });
            }}
            disabled={createOrder.isPending}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back
          </Button>
          <Button
            onClick={() => {
              void handlePlaceOrder();
            }}
            disabled={createOrder.isPending || items.length === 0}
            className="flex-1"
          >
            {createOrder.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Place order
          </Button>
        </div>
      </div>
    </div>
  );
}
