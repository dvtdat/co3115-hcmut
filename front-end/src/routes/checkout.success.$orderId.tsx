import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SuccessPage = lazy(async () => import("@/pages/checkout/SuccessPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
      <Skeleton className="mx-auto mb-4 size-12 rounded-full" />
      <Skeleton className="mx-auto mb-2 h-7 w-48" />
      <Skeleton className="mx-auto h-16 w-full rounded-xl" />
      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/checkout/success/$orderId")({
  component: SuccessRoute,
});

function SuccessRoute() {
  const { orderId } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <SuccessPage orderId={orderId} />
    </Suspense>
  );
}
