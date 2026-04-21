import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DeliveryPage = lazy(async () => import("@/pages/checkout/DeliveryPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="mb-8 h-4 w-full" />
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkout/")({
  component: DeliveryRoute,
});

function DeliveryRoute() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DeliveryPage />
    </Suspense>
  );
}
