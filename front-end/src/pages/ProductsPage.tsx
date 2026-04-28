import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteProducts } from "@/hooks/use-products";

interface ProductsPageProps {
  q?: string;
}

function ProductGridSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function ProductsPage({ q }: ProductsPageProps) {
  const navigate = useNavigate({ from: "/products/" });
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts();

  const allProducts = useMemo(() => data?.pages.flatMap((p) => p.data ?? []) ?? [], [data]);

  const products = useMemo(() => {
    const term = q?.trim().toLowerCase();
    if (!term) return allProducts;
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term),
    );
  }, [allProducts, q]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleClear() {
    void navigate({ search: { q: undefined } });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {q?.trim() ? `Results for "${q}"` : "All Products"}
        </h1>
        {q?.trim() && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="mr-1.5 size-3.5" />
            Clear search
          </Button>
        )}
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load products. Please try again later.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          products.map((product) => <ProductCard key={product._id} product={product} />)
        )}

        {!isLoading && !isError && products.length === 0 && (
          <p className="text-muted-foreground col-span-full py-16 text-center text-sm">
            {q?.trim() ? `No products found for "${q}".` : "No products found."}
          </p>
        )}

        {isFetchingNextPage && <ProductGridSkeleton />}
      </div>

      {/* Intersection sentinel — triggers next page fetch */}
      <div ref={sentinelRef} className="h-1" />

      {!hasNextPage && !isLoading && products.length > 0 && (
        <p className="text-muted-foreground mt-8 text-center text-sm">All products loaded</p>
      )}

      {isFetchingNextPage && (
        <div className="mt-6 flex justify-center">
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
