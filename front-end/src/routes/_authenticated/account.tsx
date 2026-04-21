import { createFileRoute } from "@tanstack/react-router";
import AccountLayout from "@/components/layouts/AccountLayout";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountLayout,
});
