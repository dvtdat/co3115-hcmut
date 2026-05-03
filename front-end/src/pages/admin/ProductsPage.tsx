import { useState, useMemo } from "react";
import { useForm, Controller, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Product } from "@/hooks/use-products";
import {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductItem,
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

// ── ManageVariantsDialog ───────────────────────────────────────────────────

function ManageVariantsDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { data: detail, isLoading: detailLoading } = useProduct(open ? product._id : "");
  const createMutation = useCreateProductItem();
  const deleteMutation = useDeleteProductItem();

  const items = detail?.items ?? product.items ?? [];

  const form = useForm({
    defaultValues: {
      price: product.price,
      image: "",
      status: "available",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        productId: product._id,
        body: { 
          specificPrice: values.price, 
          imageURL: values.image || undefined, 
          status: values.status as any
        },
      });
      toast.success("Variant added.");
      form.reset({ price: product.price, image: "", status: "available" });
    } catch {
      toast.error("Failed to add variant.");
    }
  };

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
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Variants for "{product.name}"</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-6">
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground py-4 text-center">
                        No variants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{formatVND(item.price)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={async () => {
                              if (confirm("Delete variant?")) {
                                await deleteMutation.mutateAsync(item._id);
                                toast.success("Variant deleted.");
                              }
                            }}
                          >
                            <Trash2 className="text-destructive size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/30 space-y-3 rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Add New Variant</h3>
              <form
                onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
                className="grid items-end gap-4 sm:grid-cols-4"
              >
                <div className="grid gap-1.5 sm:col-span-1">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                    min={0}
                    required
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-1">
                  <Label>Status</Label>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors"
                    {...form.register("status")}
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="grid gap-1.5 sm:col-span-1">
                  <Label>Image URL (Optional)</Label>
                  <Input {...form.register("image")} placeholder="https..." />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="sm:col-span-1">
                  {createMutation.isPending ? "Adding..." : "Add Variant"}
                </Button>
              </form>
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
                  <TableCell className="font-medium">{product.name}</TableCell>
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
