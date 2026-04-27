import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProductBySlug } from "@/hooks/use-products";
import { useAddCartItem } from "@/hooks/use-cart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Zap, Star, ImageOff, Loader2, Minus, Plus, Scale } from "lucide-react";

function formatVND(price: number | undefined): string {
  return `${(price ?? 0).toLocaleString("vi-VN")} ₫`;
}

// ── ProductGallery ─────────────────────────────────────────────────────────

interface ProductGalleryProps {
  imageUrl?: string;
  name: string;
}

function ProductGallery({ imageUrl, name }: ProductGalleryProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!imageUrl && !imgError;

  return (
    <div className="bg-muted aspect-square overflow-hidden rounded-xl">
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          className="size-full object-cover"
          onError={() => {
            setImgError(true);
          }}
        />
      ) : (
        <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2">
          <ImageOff className="size-12 opacity-30" />
          <span className="text-xs">No image available</span>
        </div>
      )}
    </div>
  );
}

// ── StockBadge ─────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= 10) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      >
        Only {stock} left
      </Badge>
    );
  }
  return <Badge variant="default">In Stock</Badge>;
}

// ── QuantitySelector ───────────────────────────────────────────────────────

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  max: number;
  disabled: boolean;
}

function QuantitySelector({ value, onChange, max, disabled }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Quantity</span>
      <div className="flex items-center rounded-lg border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          disabled={disabled || value <= 1}
          onClick={() => {
            onChange(value - 1);
          }}
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="min-w-8 text-center text-sm font-medium tabular-nums">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          disabled={disabled || value >= max}
          onClick={() => {
            onChange(value + 1);
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── AddToCartButton ────────────────────────────────────────────────────────

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  stock: number;
  onSuccess?: () => void;
}

function AddToCartButton({ productId, quantity, stock, onSuccess }: AddToCartButtonProps) {
  const { mutateAsync, isPending } = useAddCartItem();
  const outOfStock = stock === 0;

  async function handleAdd() {
    if (outOfStock) return;
    const safeQty = Math.min(quantity, stock);
    await mutateAsync({ productId, quantity: safeQty });
    onSuccess?.();
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={outOfStock || isPending}
      onClick={() => {
        void handleAdd();
      }}
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {outOfStock ? "Out of Stock" : isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}

// ── KeyCharacteristics ─────────────────────────────────────────────────────

function KeyCharacteristics({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="text-xs font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

// ── ProductAttributes ──────────────────────────────────────────────────────

interface AttributeItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function AttributeItem({ icon: Icon, label, value }: AttributeItemProps) {
  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

interface ProductAttributesProps {
  weight?: number;
  weightUnit?: string;
  calories?: number;
  healthScore?: number;
  shelfLife?: string;
}

function ProductAttributes({
  weight,
  weightUnit,
  calories,
  healthScore,
  shelfLife,
}: ProductAttributesProps) {
  const attrs: AttributeItemProps[] = [];

  if (weight) {
    attrs.push({
      icon: Scale,
      label: "Weight",
      value: weightUnit ? `${weight} ${weightUnit}` : String(weight),
    });
  }
  if (calories) {
    attrs.push({ icon: Zap, label: "Power", value: `${calories} W` });
  }
  if (healthScore) {
    attrs.push({ icon: Star, label: "Rating", value: `${healthScore} / 10` });
  }
  if (shelfLife) {
    attrs.push({ icon: Clock, label: "Warranty", value: shelfLife });
  }

  if (attrs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {attrs.map((attr) => (
        <AttributeItem key={attr.label} {...attr} />
      ))}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="h-5 w-56" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// ── ProductDetailPage ──────────────────────────────────────────────────────

interface ProductDetailPageProps {
  slug: string;
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const queryClient = useQueryClient();
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-destructive text-sm">Failed to load product. Please try again later.</p>
      </div>
    );
  }

  if (!product || product.deletedAt) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="text-lg font-medium">Product not found.</p>
        <a
          href="/products"
          className="text-muted-foreground hover:text-foreground mt-3 inline-block text-sm transition-colors"
        >
          Back to all products
        </a>
      </div>
    );
  }

  function handleCartSuccess() {
    setQuantity(1);
    void queryClient.invalidateQueries({ queryKey: ["products", "slug", slug] });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery imageUrl={product.imageUrl} name={product.name} />

        <div className="flex flex-col gap-4">
          {/* Category chip */}
          <a href={`/categories/${product.category.slug}`} className="w-fit">
            <Badge variant="outline" className="hover:bg-muted transition-colors">
              {product.category.name}
            </Badge>
          </a>

          {/* Name */}
          <h1 className="text-2xl leading-tight font-semibold">{product.name}</h1>

          {/* Price */}
          <p className="text-2xl font-bold">{formatVND(product.price)}</p>

          {/* Stock badge */}
          <StockBadge stock={product.stock} />

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Key characteristics */}
          {product.keyCharacteristics && product.keyCharacteristics.length > 0 && (
            <KeyCharacteristics items={product.keyCharacteristics} />
          )}

          {/* Nutrition & attributes */}
          <ProductAttributes
            weight={product.weight}
            weightUnit={product.weightUnit}
            calories={product.calories}
            healthScore={product.healthScore}
            shelfLife={product.shelfLife}
          />

          <Separator />

          {/* Purchase controls */}
          <div className="flex flex-col gap-3">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
              disabled={product.stock === 0}
            />
            <AddToCartButton
              productId={product.id}
              quantity={quantity}
              stock={product.stock}
              onSuccess={handleCartSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
