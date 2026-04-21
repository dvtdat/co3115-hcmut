import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import AdminLayout from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user?.role !== "admin") {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});
