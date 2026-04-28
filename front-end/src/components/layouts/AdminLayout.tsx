import { Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Cpu, LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  to: "/admin/dashboard" | "/admin/products" | "/admin/categories" | "/admin/orders" | "/admin/customers";
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", to: "/admin/products", icon: Package },
      { label: "Categories", to: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
      { label: "Customers", to: "/admin/customers", icon: Users },
    ],
  },
];

function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { pathname } = location;

  function handleLogout() {
    logout();
    void navigate({ to: "/login", search: { redirect: "/" } });
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link to="/" className="text-primary flex items-center gap-2 px-2 py-1 font-semibold">
          <Cpu className="size-5 shrink-0" />
          <span>TechMart</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={pathname === item.to}
                      tooltip={item.label}
                      render={<Link to={item.to} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex flex-col gap-1 px-2 py-1">
          <p className="text-sidebar-foreground text-sm font-medium">{user?.fullName || user?.email}</p>
          <p className="text-sidebar-foreground/60 truncate text-xs">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { location } = useRouterState();
  const lastSegment = location.pathname.split("/").filter(Boolean).at(-1) ?? "admin";
  const pageTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <span className="text-foreground text-sm font-medium">{pageTitle}</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
