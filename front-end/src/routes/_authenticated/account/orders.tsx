import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AccountOrdersPage = lazy(async () => import("@/pages/account/OrdersPage"));

function PageFallback() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <AccountOrdersPage />
    </Suspense>
  ),
});
