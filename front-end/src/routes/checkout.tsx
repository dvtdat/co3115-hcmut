import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/checkout")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: Outlet,
});
