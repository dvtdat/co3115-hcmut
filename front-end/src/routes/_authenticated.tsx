import { createFileRoute, redirect } from "@tanstack/react-router";
import AuthenticatedLayout from "../components/layouts/AuthenticatedLayout";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});
