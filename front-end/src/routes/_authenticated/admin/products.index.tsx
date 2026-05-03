import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminProductsPage = lazy(async () => import("@/pages/admin/ProductsPage"));

function PageFallback() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: AdminProductsIndexRoute,
});

function AdminProductsIndexRoute() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminProductsPage />
    </Suspense>
  );
}
