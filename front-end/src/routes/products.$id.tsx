import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailPage = lazy(async () => import("@/pages/ProductDetailPage"));

function PageFallback() {
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

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <ProductDetailPage id={id} />
    </Suspense>
  );
}
