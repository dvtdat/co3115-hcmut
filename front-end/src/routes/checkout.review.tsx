import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DELIVERY_OPTIONS, type DeliveryOption } from "@/schema/checkout/shippingInfo";

const ReviewPage = lazy(async () => import("@/pages/checkout/ReviewPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="mb-8 h-4 w-full" />
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
    fullName: typeof search.fullName === "string" ? search.fullName : "",
    phone: typeof search.phone === "string" ? search.phone : "",
    address: typeof search.address === "string" ? search.address : "",
    city: typeof search.city === "string" ? search.city : "",
    notes: typeof search.notes === "string" ? search.notes : undefined,
    deliveryOption: DELIVERY_OPTIONS.includes(search.deliveryOption as DeliveryOption)
      ? (search.deliveryOption as DeliveryOption)
      : DELIVERY_OPTIONS[0],
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
