import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminProductDetailPage = lazy(async () => import("@/pages/admin/ProductDetailPage"));

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: AdminProductDetailRoute,
});

function AdminProductDetailRoute() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminProductDetailPage id={id} />
    </Suspense>
  );
}
