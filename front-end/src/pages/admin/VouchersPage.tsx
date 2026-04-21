import { useState } from "react";
import { useForm, useWatch, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { components } from "@/api/schema.d.ts";
import { VOUCHER_TYPES, type VoucherType } from "@/schema/voucher";
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from "@/hooks/use-vouchers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/TablePagination";

type Voucher = components["schemas"]["Voucher"];

const DATETIME_LOCAL_LENGTH = 16;

const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  percent: "Percent (%)",
  fixed: "Fixed (₫)",
};

const SKELETON_ROW_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"] as const;

const voucherSchema = z.object({
  code: z.string().min(1, "Code is required").toUpperCase(),
  type: z.enum(VOUCHER_TYPES),
  value: z.coerce.number().positive("Value must be positive"),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscount: z.coerce.number().nonnegative().optional(),
  usageLimit: z.coerce.number().int().nonnegative().optional(),
  perUserLimit: z.coerce.number().int().nonnegative().optional(),
  validFrom: z.string().min(1, "Valid from is required"),
  validTo: z.string().min(1, "Valid to is required"),
  isActive: z.boolean().optional(),
});

type VoucherValues = z.infer<typeof voucherSchema>;

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// ── VoucherFormDialog ──────────────────────────────────────────────────────

interface VoucherFormDialogProps {
  editTarget?: Voucher;
  trigger: (onOpen: () => void) => React.ReactNode;
}

function VoucherFormDialog({ editTarget, trigger }: VoucherFormDialogProps) {
  const [open, setOpen] = useState(false);

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();

  const form = useForm<VoucherValues>({
    // z.coerce.number() infers input as unknown in zod v4 — cast resolver to fix type mismatch
    resolver: zodResolver(voucherSchema) as Resolver<VoucherValues>,
    defaultValues: {
      code: "",
      type: "percent",
      value: 0,
      isActive: true,
      validFrom: "",
      validTo: "",
    },
  });

  const watchedType = useWatch({ control: form.control, name: "type" });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        code: editTarget?.code ?? "",
        type: editTarget?.type ?? "percent",
        value: editTarget?.value ?? 0,
        minOrderAmount: editTarget?.minOrderAmount ?? undefined,
        maxDiscount: editTarget?.maxDiscount ?? undefined,
        usageLimit: editTarget?.usageLimit ?? undefined,
        perUserLimit: editTarget?.perUserLimit ?? undefined,
        validFrom: editTarget?.validFrom
          ? editTarget.validFrom.slice(0, DATETIME_LOCAL_LENGTH)
          : "",
        validTo: editTarget?.validTo ? editTarget.validTo.slice(0, DATETIME_LOCAL_LENGTH) : "",
        isActive: editTarget ? (editTarget.isActive as unknown as boolean) : true,
      });
    }
    setOpen(next);
  }

  async function onSubmit(values: VoucherValues) {
    try {
      const body = {
        ...values,
        validFrom: new Date(values.validFrom).toISOString(),
        validTo: new Date(values.validTo).toISOString(),
        minOrderAmount: (values.minOrderAmount ?? 0) > 0 ? values.minOrderAmount : undefined,
        maxDiscount: (values.maxDiscount ?? 0) > 0 ? values.maxDiscount : undefined,
        usageLimit: (values.usageLimit ?? 0) > 0 ? values.usageLimit : undefined,
        perUserLimit: (values.perUserLimit ?? 0) > 0 ? values.perUserLimit : undefined,
      };

      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget._id, body });
        toast.success("Voucher updated.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Voucher created.");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {trigger(() => {
        handleOpen(true);
      })}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-h-[75dvh] sm:max-w-[60dvw]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Voucher" : "New Voucher"}</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <form
              id="voucher-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="grid gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="v-code">
                    Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-code"
                    {...form.register("code")}
                    placeholder="e.g. SUMMER10"
                    className="font-mono uppercase"
                  />
                  {form.formState.errors.code && (
                    <p className="text-destructive text-xs">{form.formState.errors.code.message}</p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label>
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={VOUCHER_TYPE_LABELS}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent" label="Percent (%)">
                            Percent (%)
                          </SelectItem>
                          <SelectItem value="fixed" label="Fixed (₫)">
                            Fixed (₫)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="v-value">
                    Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v-value"
                    type="number"
                    min={0}
                    {...form.register("value")}
                    placeholder={watchedType === "percent" ? "10" : "50000"}
                  />
                  <p className="text-muted-foreground text-xs">
                    {watchedType === "percent" ? "Percentage (e.g. 10 = 10%)" : "Amount in VND"}
                  </p>
                  {form.formState.errors.value && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.value.message}
                    </p>
                  )}
                </div>

                {watchedType === "percent" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="v-maxDiscount">Max discount (₫)</Label>
                    <Input
                      id="v-maxDiscount"
                      type="number"
                      min={0}
                      {...form.register("maxDiscount")}
                      placeholder="50000"
                    />
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="v-minOrder">Min order amount (₫)</Label>
                  <Input
                    id="v-minOrder"
                    type="number"
                    min={0}
                    {...form.register("minOrderAmount")}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="v-usageLimit">Usage limit (total)</Label>
                  <Input
                    id="v-usageLimit"
                    type="number"
                    min={0}
                    {...form.register("usageLimit")}
                    placeholder="100"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="v-perUser">Per user limit</Label>
                  <Input
                    id="v-perUser"
                    type="number"
                    min={0}
                    {...form.register("perUserLimit")}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="v-from">
                    Valid from <span className="text-destructive">*</span>
                  </Label>
                  <Input id="v-from" type="datetime-local" {...form.register("validFrom")} />
                  {form.formState.errors.validFrom && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.validFrom.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="v-to">
                    Valid to <span className="text-destructive">*</span>
                  </Label>
                  <Input id="v-to" type="datetime-local" {...form.register("validTo")} />
                  {form.formState.errors.validTo && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.validTo.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="v-active"
                  type="checkbox"
                  {...form.register("isActive")}
                  className="size-4 rounded"
                />
                <Label htmlFor="v-active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </form>
          </DialogBody>

          <DialogFooter showCloseButton>
            <Button type="submit" form="voucher-form" disabled={isPending}>
              {isPending ? "Saving…" : editTarget ? "Save changes" : "Create voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── DeleteVoucherDialog ────────────────────────────────────────────────────

function DeleteVoucherDialog({ voucher }: { voucher: Voucher }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteVoucher();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(voucher._id);
      toast.success("Voucher deleted.");
      setOpen(false);
    } catch {
      toast.error("Failed to delete voucher.");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Trash2 className="size-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{voucher.code}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will soft-delete the voucher. It can no longer be applied to orders.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              void handleDelete();
            }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── AdminVouchersPage ──────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 5;

export default function AdminVouchersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useVouchers({
    pageNumber: page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const vouchers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vouchers</h1>
          <p className="text-muted-foreground text-sm">Manage discount vouchers</p>
        </div>
        <VoucherFormDialog
          trigger={(onOpen) => (
            <Button size="sm" onClick={onOpen}>
              <Plus className="mr-1.5 size-4" />
              New voucher
            </Button>
          )}
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load vouchers. Please try again.</p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type / Value</TableHead>
              <TableHead className="hidden md:table-cell">Min order</TableHead>
              <TableHead className="hidden lg:table-cell">Usage</TableHead>
              <TableHead className="hidden lg:table-cell">Valid to</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SKELETON_ROW_KEYS.map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                  No vouchers yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((v) => (
                <TableRow key={v._id}>
                  <TableCell className="font-mono font-semibold">{v.code}</TableCell>
                  <TableCell>
                    {v.type === "percent" ? (
                      <span>
                        {v.value}%
                        {v.maxDiscount ? (
                          <span className="text-muted-foreground ml-1 text-xs">
                            (max {formatVND(v.maxDiscount)})
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      formatVND(v.value)
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                    {v.minOrderAmount ? formatVND(v.minOrderAmount) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                    {v.usageLimit
                      ? `${v.usedCount as unknown as number} / ${v.usageLimit}`
                      : `${v.usedCount as unknown as number} used`}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                    {format(new Date(v.validTo), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={(v.isActive as unknown as boolean) ? "default" : "secondary"}>
                      {(v.isActive as unknown as boolean) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <VoucherFormDialog
                        editTarget={v}
                        trigger={(onOpen) => (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
                            onClick={onOpen}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                      />
                      <DeleteVoucherDialog voucher={v} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
