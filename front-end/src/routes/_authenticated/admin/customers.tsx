import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: lazy(async () => import("../../../pages/admin/CustomersPage")),
  pendingComponent: () => <span>Loading...</span>,
});
