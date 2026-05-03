import { useNavigate, Link } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";

interface ProductsPageProps {
  q?: string;
  page?: number;
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

export default function ProductsPage({ q, page = 1 }: ProductsPageProps) {
  const navigate = useNavigate({ from: "/products/" });

  const { data, isLoading, isError } = useProducts({
    search: q?.trim(),
    pageNumber: page,
    pageSize: 10,
  });

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleClear() {
    void navigate({ search: { q: undefined, page: 1 } });
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
      </div>

      {!isLoading && !isError && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            nativeButton={false}
            render={<Link to="/products" search={{ q, page: page - 1 }} />}
          >
            <ChevronLeft className="mr-1 size-4" />
            Prev
          </Button>
          
          <div className="text-muted-foreground px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            nativeButton={false}
            render={<Link to="/products" search={{ q, page: page + 1 }} />}
          >
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
