import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: lazy(async () => import("../../../pages/admin/OrdersPage")),
  pendingComponent: () => <span>Loading...</span>,
});
