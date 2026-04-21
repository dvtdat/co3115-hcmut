import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const HomePage = lazy(async () => import("@/pages/HomePage"));

export const Route = createFileRoute("/")({
  component: () => (
    <Suspense fallback={<div />}>
      <HomePage />
    </Suspense>
  ),
});
