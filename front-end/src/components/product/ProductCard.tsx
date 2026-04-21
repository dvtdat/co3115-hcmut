import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { components } from "@/api/schema.d.ts";
import { useAddCartItem } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: components["schemas"]["Product"];
  rating?: number;
  reviewCount?: number;
  className?: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e8f5e9/4caf50?text=No+Image";

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative inline-flex">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="text-muted-foreground/40 size-3.5" strokeWidth={1.5} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>

      <span className="text-muted-foreground text-xs">
        {clamped.toFixed(1)}
        {reviewCount > 0 && (
          <span className="ml-0.5">
            ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
          </span>
        )}
      </span>
    </div>
  );
}

export default function ProductCard({
  product,
  rating = 0,
  reviewCount = 0,
  className,
}: ProductCardProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { mutate: addToCart, isPending } = useAddCartItem();

  const imageSrc = product.imageUrl ?? PLACEHOLDER_IMAGE;
  const outOfStock = product.stock === 0;

  function handleCardClick() {
    void navigate({ to: "/products/$slug", params: { slug: product.slug } });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();

    if (!isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: `/products/${product.slug}` } });
      return;
    }

    addToCart(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to cart`, {
            action: { label: "View cart", onClick: () => void navigate({ to: "/cart" }) },
          });
        },
        onError: () => {
          toast.error("Failed to add to cart. Please try again.");
        },
      },
    );
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md",
        outOfStock && "opacity-60",
        className,
      )}
      onClick={handleCardClick}
    >
      {/* Product image */}
      <div className="bg-muted relative aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-end justify-center pb-3">
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
              Out of stock
            </span>
          </div>
        )}

        {/* Add to cart button — visible on hover when in stock */}
        {!outOfStock && (
          <button
            type="button"
            aria-label="Add to cart"
            disabled={isPending}
            onClick={handleAddToCart}
            className={cn(
              "absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200",
              "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
              "hover:bg-primary hover:text-primary-foreground",
              isPending && "translate-y-0 opacity-100",
            )}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="size-3.5" />
            )}
          </button>
        )}
      </div>

      <CardContent className="flex flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm leading-snug font-medium">{product.name}</p>
        <StarRating rating={rating} reviewCount={reviewCount} />
        <p className="text-sm font-semibold">{formatVND(product.price)}</p>
      </CardContent>
    </Card>
  );
}
