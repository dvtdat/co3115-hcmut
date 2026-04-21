import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: lazy(async () => import("../../../pages/admin/ProductsPage")),
  pendingComponent: () => <span>Loading...</span>,
});
