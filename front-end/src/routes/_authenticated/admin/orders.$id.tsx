import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminOrderDetailPage = lazy(async () => import("@/pages/admin/OrderDetailPage"));

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  component: AdminOrderDetailRoute,
});

function AdminOrderDetailRoute() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminOrderDetailPage id={id} />
    </Suspense>
  );
}
