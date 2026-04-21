import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: lazy(async () => import("../../../pages/admin/DashboardPage")),
  pendingComponent: () => <span>Loading...</span>,
});
