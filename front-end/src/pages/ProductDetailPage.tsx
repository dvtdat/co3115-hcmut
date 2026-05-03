import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProduct, type ProductItem } from "@/hooks/use-products";
import { useAddCartItem } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/authStore";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

function formatVND(price: number): string {
  return `${price.toLocaleString("vi-VN")} ₫`;
}

function ProductGallery({ image, name }: { image?: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="bg-muted aspect-square overflow-hidden rounded-xl">
      {image && !imgError ? (
        <img src={image} alt={name} className="size-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2">
          <ImageOff className="size-12 opacity-30" />
          <span className="text-xs">No image available</span>
        </div>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock <= 10) return <Badge variant="outline" className="border-amber-500/50 bg-amber-50 text-amber-700">Only {stock} left</Badge>;
  return <Badge variant="default">In Stock</Badge>;
}

interface ProductDetailPageProps {
  id: string;
}

export default function ProductDetailPage({ id }: ProductDetailPageProps) {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: product, isLoading, isError } = useProduct(id);
  const addCartItem = useAddCartItem();

  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const availableItems = product?.items?.filter((i) => i.status === "available") ?? [];
  const activeItem = selectedItem ?? availableItems[0] ?? null;
  const displayPrice = activeItem ? activeItem.price : (product?.price ?? 0);
  const displayImage = activeItem?.image ?? product?.image;
  const outOfStock = product?.stock === 0 || availableItems.length === 0;

  if (isLoading) {
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
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="text-lg font-medium">Product not found.</p>
        <a href="/products" className="text-muted-foreground hover:text-foreground mt-3 inline-block text-sm">Back to all products</a>
      </div>
    );
  }

  async function handleAddToCart() {
    if (!activeItem) return;
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart.");
      return;
    }
    await addCartItem.mutateAsync({ productItemId: activeItem._id, quantity });
    toast.success("Added to cart.");
    setQuantity(1);
    void qc.invalidateQueries({ queryKey: ["products", id] });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/products">Shop</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery image={displayImage} name={product.name} />

        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit">{product.category.name}</Badge>
          <h1 className="text-2xl leading-tight font-semibold">{product.name}</h1>
          <p className="text-2xl font-bold">{formatVND(displayPrice)}</p>
          <StockBadge stock={product.stock} />

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          {/* ProductItem selector */}
          {availableItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Select variant</p>
              <div className="flex flex-wrap gap-2">
                {availableItems.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      activeItem?._id === item._id
                        ? "border-primary bg-primary/5 ring-primary ring-1"
                        : "hover:border-muted-foreground/40"
                    }`}
                  >
                    {formatVND(item.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center rounded-lg border">
                <Button variant="ghost" size="icon" disabled={quantity <= 1 || outOfStock} onClick={() => setQuantity(q => q - 1)}>
                  <Minus className="size-3.5" />
                </Button>
                <span className="min-w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <Button variant="ghost" size="icon" disabled={quantity >= product.stock || outOfStock} onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={outOfStock || addCartItem.isPending || !activeItem}
              onClick={() => { void handleAddToCart(); }}
            >
              {addCartItem.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {product.stock > 0 && availableItems.length === 0 
                ? "Error: No variations configured" 
                : outOfStock ? "Out of Stock" 
                : addCartItem.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
