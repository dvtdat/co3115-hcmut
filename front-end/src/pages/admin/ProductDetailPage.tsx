import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm, Controller, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { ProductItem } from "@/hooks/use-products";
import {
  useProduct,
  useCreateProductItem,
  useUpdateProductItem,
  useDeleteProductItem,
} from "@/hooks/use-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ── Helpers ────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  out_of_stock: "Out of stock",
  discontinued: "Discontinued",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "available")
    return <Badge variant="outline" className="border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Available</Badge>;
  if (status === "out_of_stock")
    return <Badge variant="destructive">Out of stock</Badge>;
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Discontinued
    </Badge>
  );
}

// ── Item form schema ───────────────────────────────────────────────────────

const itemSchema = z.object({
  specificPrice: z.number({ error: "Price must be a number" }).min(0, "Price must be ≥ 0"),
  imageURL: z.string().optional(),
  status: z.enum(["available", "out_of_stock", "discontinued"]),
});

type ItemValues = z.infer<typeof itemSchema>;

// ── ItemFormDialog ─────────────────────────────────────────────────────────

interface ItemFormDialogProps {
  productId: string;
  editTarget?: ProductItem;
  trigger: (onOpen: () => void) => React.ReactNode;
}

function ItemFormDialog({ productId, editTarget, trigger }: ItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProductItem();
  const updateMutation = useUpdateProductItem();

  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema) as Resolver<ItemValues>,
    defaultValues: { specificPrice: 0, imageURL: "", status: "available" },
  });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        specificPrice: editTarget?.price ?? 0,
        imageURL: editTarget?.image ?? "",
        status: (editTarget?.status as ItemValues["status"]) ?? "available",
      });
    }
    setOpen(next);
  }

  const onSubmit: SubmitHandler<ItemValues> = async (values) => {
    const body = {
      specificPrice: values.specificPrice,
      imageURL: values.imageURL?.trim() || undefined,
      status: values.status,
    };

    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ itemId: editTarget._id, body });
        toast.success("Item updated.");
      } else {
        await createMutation.mutateAsync({ productId, body });
        toast.success("Item created.");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {trigger(() => handleOpen(true))}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit item" : "Add item"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="item-form"
              onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }}
              className="grid gap-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="item-price">
                  Price (₫) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-price"
                  type="number"
                  min={0}
                  {...form.register("specificPrice", { valueAsNumber: true })}
                />
                {form.formState.errors.specificPrice && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.specificPrice.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="item-image">Image URL</Label>
                <Input
                  id="item-image"
                  {...form.register("imageURL")}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={STATUS_LABELS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["available", "out_of_stock", "discontinued"] as const).map((s) => (
                          <SelectItem key={s} value={s} label={STATUS_LABELS[s]}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter showCloseButton>
            <Button type="submit" form="item-form" disabled={isPending}>
              {isPending ? "Saving…" : editTarget ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── DeleteItemDialog ───────────────────────────────────────────────────────

function DeleteItemDialog({ item }: { item: ProductItem }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteProductItem();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(item._id);
      toast.success("Item deleted.");
      setOpen(false);
    } catch {
      toast.error("Failed to delete item.");
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
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            Price: {formatVND(item.price)}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => { void handleDelete(); }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── AdminProductDetailPage ─────────────────────────────────────────────────

interface AdminProductDetailPageProps {
  id: string;
}

export default function AdminProductDetailPage({ id }: AdminProductDetailPageProps) {
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/admin/products" />}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to products
        </Button>
        <p className="text-destructive text-sm">Product not found or failed to load.</p>
      </div>
    );
  }

  const items = product.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          nativeButton={false}
          render={<Link to="/admin/products" />}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to products
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline">{product.category.name}</Badge>
              <span>Base price: {formatVND(product.price)}</span>
              <span>Stock: {product.stock}</span>
            </div>
            {product.description && (
              <p className="text-muted-foreground mt-1 max-w-prose text-sm">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Items</h2>
            <p className="text-muted-foreground text-sm">
              Sellable variants with individual prices and availability
            </p>
          </div>
          <ItemFormDialog
            productId={id}
            trigger={(onOpen) => (
              <Button size="sm" onClick={onOpen}>
                <Plus className="mr-1.5 size-4" />
                Add item
              </Button>
            )}
          />
        </div>

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">
                    No items yet. Add the first one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt="item"
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageOff className="text-muted-foreground/40 size-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {formatVND(item.price)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ItemFormDialog
                          productId={id}
                          editTarget={item}
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
                        <DeleteItemDialog item={item} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
