import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/vouchers")({
  component: lazy(async () => import("../../../pages/admin/VouchersPage")),
  pendingComponent: () => <span>Loading...</span>,
});
