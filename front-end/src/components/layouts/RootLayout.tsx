import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, ShoppingCart, Menu, LogOut, User, Package, LayoutDashboard } from "lucide-react";
import SearchBar from "@/components/nav/SearchBar";
import ChatbotWidget from "@/components/ChatbotWidget";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Only mount when authenticated to avoid 401 on unauthenticated requests
function CartIconWithCount() {
  const { data } = useCart();
  const items = (data as { items?: { quantity?: number }[] } | undefined)?.items ?? [];
  const count = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Cart"
      nativeButton={false}
      render={<Link to="/cart" />}
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full text-[10px] font-medium">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export default function RootLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  function handleLogout() {
    logout();
    void navigate({ to: "/login", search: { redirect: "/" } });
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Left — Logo + desktop nav */}
          <div className="flex shrink-0 items-center gap-6">
            <Link to="/" className="text-primary flex items-center gap-1.5 font-semibold">
              <Leaf className="size-5" />
              <span>HealthyFood</span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden items-center gap-1 md:flex">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                  activeProps={{ className: "bg-muted text-foreground" }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                  activeProps={{ className: "bg-muted text-foreground" }}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                  activeProps={{ className: "bg-muted text-foreground" }}
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Center — Search */}
          <div className="hidden flex-1 items-center md:flex">
            <SearchBar />
          </div>

          {/* Right — Cart + User */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <CartIconWithCount />
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                    <Avatar size="sm">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-muted-foreground truncate font-normal">
                        {user?.email}
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuItem render={<Link to="/admin/dashboard" />}>
                          <LayoutDashboard className="mr-2 size-4" />
                          Admin Panel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem render={<Link to="/account/orders" />}>
                      <Package className="mr-2 size-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link to="/account/profile" />}>
                      <User className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link to="/login" search={{ redirect: "/" }} />}
                >
                  Login
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-primary flex items-center gap-1.5">
                    <Leaf className="size-4" />
                    HealthyFood
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-4">
                  <div className="mb-2">
                    <SearchBar
                      onNavigate={() => {
                        setMobileOpen(false);
                      }}
                    />
                  </div>
                  {(
                    [
                      { label: "Home", to: "/" },
                      { label: "Shop", to: "/products" },
                      { label: "About", to: "/about" },
                    ] as const
                  ).map(({ label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => {
                        setMobileOpen(false);
                      }}
                      className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Chatbot ── */}
      {isAuthenticated && <ChatbotWidget />}

      {/* ── Footer ── */}
      <footer className="bg-background border-t">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="text-primary flex items-center gap-1.5 text-sm font-semibold">
            <Leaf className="size-4" />
            HealthyFood
          </span>
          <span className="text-muted-foreground text-xs">© 2026 HealthyFood. CO3027 HCMUT</span>
        </div>
      </footer>
    </div>
  );
}
