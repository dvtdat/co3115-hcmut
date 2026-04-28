import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Category } from "@/hooks/use-categories";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
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
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import TablePagination from "@/components/TablePagination";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryValues = z.infer<typeof categorySchema>;

// ── CategoryFormDialog ─────────────────────────────────────────────────────

interface CategoryFormDialogProps {
  editTarget?: Category;
  trigger: (onOpen: () => void) => React.ReactNode;
}

function CategoryFormDialog({ editTarget, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  function handleOpen(next: boolean) {
    if (next) {
      form.reset({
        name: editTarget?.name ?? "",
        description: editTarget?.description ?? "",
      });
    }
    setOpen(next);
  }

  async function onSubmit(values: CategoryValues) {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          id: editTarget._id,
          body: { categoryName: values.name, description: values.description },
        });
        toast.success("Category updated.");
      } else {
        await createMutation.mutateAsync({
          categoryName: values.name,
          description: values.description,
        });
        toast.success("Category created.");
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
            <DialogTitle>{editTarget ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="category-form"
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="grid gap-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="cat-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input id="cat-name" {...form.register("name")} placeholder="e.g. Audio" />
                {form.formState.errors.name && (
                  <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  {...form.register("description")}
                  placeholder="Short description…"
                  rows={3}
                />
              </div>
            </form>
          </DialogBody>
          <DialogFooter showCloseButton>
            <Button type="submit" form="category-form" disabled={isPending}>
              {isPending ? "Saving…" : editTarget ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── DeleteCategoryDialog ───────────────────────────────────────────────────

function DeleteCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteCategory();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(category._id);
      toast.success("Category deleted.");
      setOpen(false);
    } catch {
      toast.error("Failed to delete category.");
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
          <AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Products linked to this category may be affected.
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

// ── AdminCategoriesPage ────────────────────────────────────────────────────

const ADMIN_PAGE_SIZE = 5;

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useCategories({
    pageNumber: page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const allCategories = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allCategories;
    return allCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [allCategories, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">Manage product categories</p>
        </div>
        <CategoryFormDialog
          trigger={(onOpen) => (
            <Button size="sm" onClick={onOpen}>
              <Plus className="mr-1.5 size-4" />
              New category
            </Button>
          )}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search categories..."
          className="pl-8"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {isError && (
        <p className="text-destructive text-sm">Failed to load categories. Please try again.</p>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground py-12 text-center">
                  {search ? "No categories match your search." : "No categories yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden max-w-xs truncate md:table-cell">
                    {cat.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <CategoryFormDialog
                        editTarget={cat}
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
                      <DeleteCategoryDialog category={cat} />
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
