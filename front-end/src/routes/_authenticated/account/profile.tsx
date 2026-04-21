import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = lazy(async () => import("@/pages/account/ProfilePage"));

function PageFallback() {
  return (
    <div className="max-w-lg space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/account/profile")({
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <ProfilePage />
    </Suspense>
  ),
});
