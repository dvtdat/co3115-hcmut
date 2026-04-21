import { useState, useMemo } from "react";
import { useForm, Controller, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { components } from "@/api/schema.d.ts";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import ImageUpload from "@/components/admin/ImageUpload";
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
import { ImageOff, Pencil, Plus, Search, Trash2 } from "lucide-react";

type Product = components["schemas"]["Product"];

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number({ error: "Price must be a number" }).min(0, "Price must be ≥ 0"),
  stock: z.number({ error: "Stock must be a number" }).int().min(0, "Stock must be ≥ 0"),
  categoryId: z.string().min(1, "Category is required"),
  keyCharacteristics: z.string().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  weightUnit: z.string().optional(),
  calories: z.coerce.number().nonnegative().optional(),
  healthScore: z.coerce.number().min(0).max(10).optional(),
  shelfLife: z.string().optional(),
});

type ProductValues = z.infer<typeof productSchema>;

const LOW_STOCK_THRESHOLD = 5;

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);

  const { data: catData } = useCategories();
  const categories = catData?.data ?? (Array.isArray(catData) ? catData : []);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductValues>,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      keyCharacteristics: "",
      weight: undefined,
      weightUnit: "",
      calories: undefined,
      healthScore: undefined,
      shelfLife: "",
    },
  });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        name: editTarget?.name ?? "",
        slug: editTarget?.slug ?? "",
        description: editTarget?.description ?? "",
        price: editTarget?.price ?? 0,
        stock: editTarget?.stock ?? 0,
        categoryId: editTarget?.category.id ?? "",
        keyCharacteristics: editTarget?.keyCharacteristics?.join("\n") ?? "",
        weight: editTarget?.weight ?? undefined,
        weightUnit: editTarget?.weightUnit ?? "",
        calories: editTarget?.calories ?? undefined,
        healthScore: editTarget?.healthScore ?? undefined,
        shelfLife: editTarget?.shelfLife ?? "",
      });
      setUploadedImageUrl(editTarget?.imageUrl);
    }
    setOpen(next);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue("name", e.target.value);
    if (!editTarget) {
      form.setValue("slug", toSlug(e.target.value), { shouldValidate: false });
    }
  }

  const onSubmit: SubmitHandler<ProductValues> = async (values) => {
    const keyCharacteristics = values.keyCharacteristics
      ? values.keyCharacteristics
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const body = {
      ...values,
      imageUrl: uploadedImageUrl,
      keyCharacteristics: keyCharacteristics?.length ? keyCharacteristics : undefined,
      weight: (values.weight ?? 0) > 0 ? values.weight : undefined,
      calories: (values.calories ?? 0) > 0 ? values.calories : undefined,
      healthScore: (values.healthScore ?? 0) > 0 ? values.healthScore : undefined,
      weightUnit: values.weightUnit ?? undefined,
      shelfLife: values.shelfLife ?? undefined,
    };

    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, body });
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
                <Label>Image</Label>
                <ImageUpload
                  folder="products"
                  initialUrl={editTarget?.imageUrl}
                  onUploadComplete={(url) => {
                    setUploadedImageUrl(url ?? undefined);
                  }}
                  className="max-w-35"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prod-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prod-name"
                  {...form.register("name", { onChange: handleNameChange })}
                  placeholder="e.g. Organic Broccoli"
                />
                {form.formState.errors.name && (
                  <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prod-slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prod-slug"
                  {...form.register("slug")}
                  placeholder="e.g. organic-broccoli"
                  className="font-mono text-xs"
                />
                {form.formState.errors.slug && (
                  <p className="text-destructive text-xs">{form.formState.errors.slug.message}</p>
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
                    Price (₫) <span className="text-destructive">*</span>
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
                      items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} label={cat.name}>
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

              {/* Nutrition & attributes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-weight">Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="prod-weight"
                      type="number"
                      min={0}
                      placeholder="330"
                      {...form.register("weight")}
                      className="flex-1"
                    />
                    <Input placeholder="g" {...form.register("weightUnit")} className="w-16" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-calories">Calories (kcal)</Label>
                  <Input
                    id="prod-calories"
                    type="number"
                    min={0}
                    placeholder="280"
                    {...form.register("calories")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-health-score">
                    Health score <span className="text-muted-foreground font-normal">(0–10)</span>
                  </Label>
                  <Input
                    id="prod-health-score"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    placeholder="8.8"
                    {...form.register("healthScore")}
                  />
                  {form.formState.errors.healthScore && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.healthScore.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="prod-shelf-life">Shelf life</Label>
                  <Input
                    id="prod-shelf-life"
                    placeholder="1 day (refrigerated)"
                    {...form.register("shelfLife")}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="prod-characteristics">
                  Key characteristics{" "}
                  <span className="text-muted-foreground font-normal">(one per line)</span>
                </Label>
                <Textarea
                  id="prod-characteristics"
                  placeholder={"High protein\nOmega-3 rich\nLow GI"}
                  rows={3}
                  {...form.register("keyCharacteristics")}
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
      await deleteMutation.mutateAsync(product.id);
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
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
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
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
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
