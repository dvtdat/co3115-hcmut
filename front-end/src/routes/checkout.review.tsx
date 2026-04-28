import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RECEIVING_METHODS, type ReceivingMethod } from "@/schema/checkout/shippingInfo";

const ReviewPage = lazy(async () => import("@/pages/checkout/ReviewPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="mt-4 h-52 w-full rounded-xl" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkout/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    receivingMethod: RECEIVING_METHODS.includes(search.receivingMethod as ReceivingMethod)
      ? (search.receivingMethod as ReceivingMethod)
      : "delivery",
    shippingAddress: typeof search.shippingAddress === "string" ? search.shippingAddress : "",
  }),
  component: ReviewRoute,
});

function ReviewRoute() {
  const shippingInfo = Route.useSearch();
  return (
    <Suspense fallback={<PageFallback />}>
      <ReviewPage shippingInfo={shippingInfo} />
    </Suspense>
  );
}
