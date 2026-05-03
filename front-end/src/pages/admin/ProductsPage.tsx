import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useForm, Controller, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Product } from "@/hooks/use-products";
import type { ProductItem } from "@/hooks/use-products";
import {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductItem,
  useUpdateProductItem,
  useDeleteProductItem,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import TablePagination from "@/components/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageOff, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number({ error: "Price must be a number" }).min(0, "Price must be ≥ 0"),
  stock: z.number({ error: "Stock must be a number" }).int().min(0, "Stock must be ≥ 0"),
  categoryId: z.string().min(1, "Category is required"),
  defaultImage: z.string().optional(),
});

type ProductValues = z.infer<typeof productSchema>;

const LOW_STOCK_THRESHOLD = 5;

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

// ── ProductFormDialog ──────────────────────────────────────────────────────

interface ProductFormDialogProps {
  editTarget?: Product;
  trigger: (onOpen: () => void) => React.ReactNode;
}

function ProductFormDialog({ editTarget, trigger }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: catData } = useCategories();
  const categories = catData?.data ?? (Array.isArray(catData) ? catData : []);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductValues>,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      defaultImage: "",
    },
  });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        name: editTarget?.name ?? "",
        description: editTarget?.description ?? "",
        price: editTarget?.price ?? 0,
        stock: editTarget?.stock ?? 0,
        categoryId: editTarget?.category._id ?? "",
        defaultImage: editTarget?.image ?? "",
      });
    }
    setOpen(next);
  }

  const onSubmit: SubmitHandler<ProductValues> = async (values) => {
    const body = {
      productName: values.name,
      basePrice: values.price,
      stockQuantity: values.stock,
      categoryId: values.categoryId,
      description: values.description ?? undefined,
      defaultImage: values.defaultImage?.trim() || undefined,
    };

    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget._id, body });
        toast.success("Product updated.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Product created.");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {trigger(() => {
        handleOpen(true);
      })}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-h-[75dvh] sm:max-w-[60dvw]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="product-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="grid gap-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="prod-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prod-name"
                  {...form.register("name")}
                  placeholder="e.g. Wireless Headphones"
                />
                {form.formState.errors.name && (
                  <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prod-desc">Description</Label>
                <Textarea
                  id="prod-desc"
                  {...form.register("description")}
                  placeholder="Product description…"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-price">
                    Base price (₫) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    min={0}
                    {...form.register("price", { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-stock">
                    Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    min={0}
                    step={1}
                    {...form.register("stock", { valueAsNumber: true })}
                  />
                  {form.formState.errors.stock && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={Object.fromEntries(categories.map((c) => [c._id, c.name]))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id} label={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prod-image">Image URL</Label>
                <Input
                  id="prod-image"
                  {...form.register("defaultImage")}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter showCloseButton>
            <Button type="submit" form="product-form" disabled={isPending}>
              {isPending ? "Saving…" : editTarget ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── DeleteProductDialog ────────────────────────────────────────────────────

function DeleteProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteProduct();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(product._id);
      toast.success("Product deleted.");
      setOpen(false);
    } catch {
      toast.error("Failed to delete product.");
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
          <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

// ── Variant helpers ────────────────────────────────────────────────────────

const VARIANT_STATUS_LABELS: Record<string, string> = {
  available: "Available",
  out_of_stock: "Out of stock",
  discontinued: "Discontinued",
};

function VariantStatusBadge({ status }: { status: string }) {
  if (status === "available")
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      >
        Available
      </Badge>
    );
  if (status === "out_of_stock") return <Badge variant="destructive">Out of stock</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Discontinued</Badge>;
}

const variantSchema = z.object({
  specificPrice: z.number({ error: "Price must be a number" }).min(0, "Price must be ≥ 0"),
  imageURL: z.string().optional(),
  status: z.enum(["available", "out_of_stock", "discontinued"]),
});

type VariantValues = z.infer<typeof variantSchema>;

// ── VariantFormDialog ──────────────────────────────────────────────────────

interface VariantFormDialogProps {
  productId: string;
  editTarget?: ProductItem;
  defaultPrice?: number;
  trigger: (onOpen: () => void) => React.ReactNode;
}

function VariantFormDialog({ productId, editTarget, defaultPrice = 0, trigger }: VariantFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProductItem();
  const updateMutation = useUpdateProductItem();

  const form = useForm<VariantValues>({
    resolver: zodResolver(variantSchema) as Resolver<VariantValues>,
    defaultValues: { specificPrice: defaultPrice, imageURL: "", status: "available" },
  });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        specificPrice: editTarget?.price ?? defaultPrice,
        imageURL: editTarget?.image ?? "",
        status: (editTarget?.status as VariantValues["status"]) ?? "available",
      });
    }
    setOpen(next);
  }

  const onSubmit: SubmitHandler<VariantValues> = async (values) => {
    const body = {
      specificPrice: values.specificPrice,
      imageURL: values.imageURL?.trim() || undefined,
      status: values.status,
    };
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ itemId: editTarget._id, body });
        toast.success("Variant updated.");
      } else {
        await createMutation.mutateAsync({ productId, body });
        toast.success("Variant added.");
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
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit variant" : "Add variant"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="variant-form"
              onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }}
              className="grid gap-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="variant-price">
                  Price (₫) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="variant-price"
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
                <Label htmlFor="variant-image">Image URL</Label>
                <Input
                  id="variant-image"
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
                      items={VARIANT_STATUS_LABELS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["available", "out_of_stock", "discontinued"] as const).map((s) => (
                          <SelectItem key={s} value={s} label={VARIANT_STATUS_LABELS[s]}>
                            {VARIANT_STATUS_LABELS[s]}
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
            <Button type="submit" form="variant-form" disabled={isPending}>
              {isPending ? "Saving…" : editTarget ? "Save changes" : "Add variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── DeleteVariantDialog ────────────────────────────────────────────────────

function DeleteVariantDialog({ item }: { item: ProductItem }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteProductItem();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(item._id);
      toast.success("Variant deleted.");
      setOpen(false);
    } catch {
      toast.error("Failed to delete variant.");
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
          <AlertDialogTitle>Delete this variant?</AlertDialogTitle>
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

// ── ManageVariantsDialog ───────────────────────────────────────────────────

function ManageVariantsDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { data: detail, isLoading } = useProduct(open ? product._id : "");
  const items = detail?.items ?? [];

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Layers className="size-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Variants — {product.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Image</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="size-8 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-8 text-center text-sm">
                        No variants yet. Add the first one below.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="bg-muted flex size-8 items-center justify-center overflow-hidden rounded-md">
                            {item.image ? (
                              <img src={item.image} alt="variant" className="size-full object-cover" />
                            ) : (
                              <ImageOff className="text-muted-foreground/40 size-3.5" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums font-medium">
                          {formatVND(item.price)}
                        </TableCell>
                        <TableCell>
                          <VariantStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <VariantFormDialog
                              productId={product._id}
                              editTarget={item}
                              defaultPrice={product.price}
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
                            <DeleteVariantDialog item={item} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                Add new variant
              </p>
              <VariantFormDialog
                productId={product._id}
                defaultPrice={product.price}
                trigger={(onOpen) => (
                  <Button size="sm" onClick={onOpen}>
                    <Plus className="mr-1.5 size-4" />
                    Add variant
                  </Button>
                )}
              />
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── AdminProductsPage ──────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const isSearching = search.trim().length > 0;

  const { data, isLoading, isError } = useProducts({
    pageNumber: isSearching ? 1 : page,
    pageSize: isSearching ? 9999 : ADMIN_PAGE_SIZE,
  });

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your product catalog</p>
        </div>
        <ProductFormDialog
          trigger={(onOpen) => (
            <Button size="sm" onClick={onOpen}>
              <Plus className="mr-1.5 size-4" />
              New product
            </Button>
          )}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load products. Please try again.</p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="size-10 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                  {search ? "No products match your search." : "No products yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageOff className="text-muted-foreground/40 size-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to="/admin/products/$id"
                      params={{ id: product._id }}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{product.category.name}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatVND(product.price)}</TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        Low · {product.stock}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground tabular-nums">{product.stock}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ManageVariantsDialog product={product} />
                      <ProductFormDialog
                        editTarget={product}
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
                      <DeleteProductDialog product={product} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isSearching && (
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
