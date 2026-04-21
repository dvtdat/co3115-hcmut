import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: lazy(async () => import("../../../pages/admin/CategoriesPage")),
  pendingComponent: () => <span>Loading...</span>,
});
