import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { BEUser } from "@/api/services/user.api";
import { useUsers, useUserOrders, useUpdateUserStatus } from "@/hooks/use-users";
import type { OrderStatus } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import TablePagination from "@/components/TablePagination";

const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  confirmed: "default",
  shipping: "default",
  delivered: "outline",
  cancelled: "destructive",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function formatDate(raw: unknown): string {
  try {
    return new Date(raw as string).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ── CustomerDetailDialog ───────────────────────────────────────────────────

function CustomerDetailDialog({ user }: { user: BEUser }) {
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders(user.id);
  const orders = ordersData?.data ?? [];

  const totalSpend = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div className="grid gap-5">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{user.email}</p>
          <p className="text-muted-foreground text-sm capitalize">{user.role}</p>
        </div>
        <Badge variant="outline" className="ml-auto capitalize">
          {user.role}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border px-3 py-2 text-center">
          {ordersLoading ? (
            <Skeleton className="mx-auto h-6 w-10" />
          ) : (
            <p className="text-lg font-semibold tabular-nums">{orders.length}</p>
          )}
          <p className="text-muted-foreground text-xs">Total orders</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          {ordersLoading ? (
            <Skeleton className="mx-auto h-6 w-24" />
          ) : (
            <p className="text-lg font-semibold tabular-nums">{formatVND(totalSpend)}</p>
          )}
          <p className="text-muted-foreground text-xs">Total spend</p>
        </div>
      </div>

      <Separator />

      {/* Order history */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Order History
        </p>
        {ordersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">No orders yet.</p>
        ) : (
          <div className="max-h-56 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{order._id.slice(-8)}</TableCell>
                    <TableCell className="tabular-nums">{formatVND(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ORDER_STATUS_VARIANTS[order.status as OrderStatus] ?? "secondary"}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AdminCustomersPage ─────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 5;

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingUser, setViewingUser] = useState<BEUser | null>(null);

  const { data, isLoading, isError } = useUsers({
    pageNumber: page,
    pageSize: ADMIN_PAGE_SIZE,
  });
  const updateStatus = useUpdateUserStatus();

  const allUsers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.email.toLowerCase().includes(q));
  }, [allUsers, search]);

  async function handleToggleActive(user: BEUser, isActive: boolean) {
    try {
      await updateStatus.mutateAsync({ id: user.id, isActive });
      toast.success(`${user.email} ${isActive ? "activated" : "deactivated"}.`);
    } catch {
      toast.error("Failed to update user status.");
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Customers</h1>
          <p className="text-muted-foreground text-sm">Manage registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by email…"
          className="pl-8"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load customers. Please try again.</p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">
                  {search ? "No customers match your search." : "No customers yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const isActive = Boolean(user.isActive);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => {
                          void handleToggleActive(user, checked);
                        }}
                        disabled={updateStatus.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingUser(user);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Customer detail dialog */}
      <Dialog
        open={!!viewingUser}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
      >
        <DialogContent className="max-h-[75dvh] sm:max-w-[60dvw]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          <DialogBody>{viewingUser && <CustomerDetailDialog user={viewingUser} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
