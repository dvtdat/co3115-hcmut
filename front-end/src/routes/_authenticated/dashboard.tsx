import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: lazy(async () => import("../../pages/DashboardPage")),
  // TODO: Remove with Loader Component
  pendingComponent: () => <span>Loading...</span>,
});
