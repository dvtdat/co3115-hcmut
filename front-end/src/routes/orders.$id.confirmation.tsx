import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

const OrderConfirmationPage = lazy(async () => import("@/pages/OrderConfirmationPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export const Route = createFileRoute("/orders/$id/confirmation")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { id } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <OrderConfirmationPage id={id} />
    </Suspense>
  );
}
