import type { CartItem } from "@/hooks/use-cart";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

function formatVND(price: number | undefined): string {
  return `${(price ?? 0).toLocaleString("vi-VN")} ₫`;
}

// ── CartItemRow ────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const isUpdating = updateItem.isPending;
  const isRemoving = removeItem.isPending;
  const outOfStock = item.product.stock === 0;
  const unitPrice = item.product.price;
  const subtotal = unitPrice * item.quantity;

  function handleQtyChange(next: number) {
    updateItem.mutate({
      cartItemId: item._id,
      body: { quantity: next },
    });
  }

  function handleRemove() {
    removeItem.mutate(item._id);
  }

  return (
    <div className="flex gap-4 py-5">
      {/* Thumbnail */}
      <a href={`/products/${item.product._id}`} className="shrink-0">
        <div className="bg-muted size-20 overflow-hidden rounded-lg">
          {item.product.image ? (
            <img
              src={item.product.image}
              alt={item.product.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center">
              <ImageOff className="size-6 opacity-30" />
            </div>
          )}
        </div>
      </a>

      {/* Info + controls */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Name, badge, unit price */}
        <div className="min-w-0 flex-1 space-y-1">
          <a
            href={`/products/${item.product._id}`}
            className="line-clamp-2 text-sm leading-snug font-medium hover:underline"
          >
            {item.product.name}
          </a>
          {outOfStock && (
            <Badge variant="destructive" className="w-fit">
              Out of Stock
            </Badge>
          )}
          <p className="text-muted-foreground text-xs">{formatVND(unitPrice)} / item</p>
        </div>

        {/* Quantity stepper + subtotal + remove */}
        <div className="flex items-center gap-4">
          {/* Stepper */}
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Decrease quantity"
              disabled={outOfStock || isUpdating || item.quantity <= 1}
              onClick={() => {
                handleQtyChange(item.quantity - 1);
              }}
            >
              <Minus className="size-3" />
            </Button>

            <span className="flex min-w-7 items-center justify-center text-sm tabular-nums">
              {isUpdating ? <Loader2 className="size-3 animate-spin" /> : item.quantity}
            </span>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Increase quantity"
              disabled={outOfStock || isUpdating || item.quantity >= item.product.stock}
              onClick={() => {
                handleQtyChange(item.quantity + 1);
              }}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {/* Subtotal */}
          <p className="min-w-[80px] text-right text-sm font-semibold">{formatVND(subtotal)}</p>

          {/* Remove */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove item"
            className="text-muted-foreground hover:text-destructive"
            disabled={isRemoving}
            onClick={handleRemove}
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── OrderSummary ───────────────────────────────────────────────────────────

interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
}

function OrderSummary({ subtotal, itemCount }: OrderSummaryProps) {
  return (
    <div className="sticky top-20 flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="font-semibold">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatVND(subtotal)}</span>
      </div>

      <Button size="lg" className="w-full" render={<a href="/checkout" />}>
        Proceed to Checkout
      </Button>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-5">
              <Skeleton className="size-20 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="mt-2 h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <ShoppingCart className="text-muted-foreground/30 mx-auto size-12" />
      <p className="mt-4 text-lg font-medium">Your cart is empty</p>
      <p className="text-muted-foreground mt-1 text-sm">Add some products to get started.</p>
      <Button className="mt-6" render={<a href="/products" />}>
        Browse Products
      </Button>
    </div>
  );
}

// ── Unauthenticated state ──────────────────────────────────────────────────

function UnauthenticatedCart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <ShoppingCart className="text-muted-foreground/30 mx-auto size-12" />
      <p className="mt-4 text-lg font-medium">Sign in to view your cart</p>
      <p className="text-muted-foreground mt-1 text-sm">Your cart is saved to your account.</p>
      <Button className="mt-6" render={<a href="/login" />}>
        Sign In
      </Button>
    </div>
  );
}

// ── CartPage ───────────────────────────────────────────────────────────────

export default function CartPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: cart, isLoading, isError } = useCart();

  if (!isAuthenticated) return <UnauthenticatedCart />;
  if (isLoading) return <CartSkeleton />;

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-destructive text-sm">Failed to load cart. Please try again later.</p>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) return <EmptyCart />;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Item list */}
        <div className="flex flex-col divide-y">
          {items.map((item) => (
            <CartItemRow key={item._id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div>
          <OrderSummary subtotal={subtotal} itemCount={items.length} />
        </div>
      </div>
    </div>
  );
}
