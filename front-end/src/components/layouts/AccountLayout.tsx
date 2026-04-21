import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { User, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: "/account/profile" | "/account/orders";
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Profile", to: "/account/profile", icon: User },
  { label: "My Orders", to: "/account/orders", icon: Package },
];

export default function AccountLayout() {
  const { location } = useRouterState();
  const { pathname } = location;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* Sidebar */}
        <aside className="shrink-0 md:w-52">
          <nav className="flex flex-row gap-1 md:flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
