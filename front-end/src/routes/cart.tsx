import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CartPage = lazy(async () => import("@/pages/CartPage"));

function PageFallback() {
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

export const Route = createFileRoute("/cart")({
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <CartPage />
    </Suspense>
  ),
});
