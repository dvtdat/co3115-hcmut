import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../pages/LoginPage";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/dashboard",
  }),
  beforeLoad: ({ search }) => {
    if (useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: search.redirect });
    }
  },
  component: LoginPage,
});
