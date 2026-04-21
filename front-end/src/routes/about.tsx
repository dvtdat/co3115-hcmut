import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AboutPage = lazy(async () => import("@/pages/AboutPage"));

export const Route = createFileRoute("/about")({
  component: () => (
    <Suspense>
      <AboutPage />
    </Suspense>
  ),
});
