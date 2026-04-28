import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const RegisterPage = lazy(async () => import("@/pages/RegisterPage"));

export const Route = createFileRoute("/register")({
  component: RegisterRoute,
});

function RegisterRoute() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-12"><Skeleton className="h-96 w-full rounded-xl" /></div>}>
      <RegisterPage />
    </Suspense>
  );
}
