import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentPage = lazy(async () => import("@/pages/checkout/PaymentPage"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="mb-8 h-4 w-full" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="mt-4 h-72 w-full rounded-2xl" />
    </div>
  );
}

export const Route = createFileRoute("/checkout/payment/$orderId")({
  component: PaymentRoute,
});

function PaymentRoute() {
  const { orderId } = Route.useParams();
  return (
    <Suspense fallback={<PageFallback />}>
      <PaymentPage orderId={orderId} />
    </Suspense>
  );
}
