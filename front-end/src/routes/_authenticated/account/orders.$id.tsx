import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const OrderDetailPage = lazy(async () => import("@/pages/account/OrderDetailPage"));

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <OrderDetailPage id={id} />
    </Suspense>
  );
}
