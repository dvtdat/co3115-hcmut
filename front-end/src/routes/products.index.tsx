import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

const ProductsPage = lazy(async () => import("@/pages/ProductsPage"));

const searchSchema = z.object({
  q: z.string().optional(),
});

function PageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ProductsPageRoute() {
  const { q } = Route.useSearch();
  return (
    <Suspense fallback={<PageFallback />}>
      <ProductsPage q={q} />
    </Suspense>
  );
}

export const Route = createFileRoute("/products/")({
  validateSearch: searchSchema,
  component: ProductsPageRoute,
});
