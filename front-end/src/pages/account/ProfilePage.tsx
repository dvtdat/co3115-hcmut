import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCurrentUser, useUpdateUser } from "@/hooks/use-users";
import { useAuthStore } from "@/store/authStore";
import { updateProfileSchema, type UpdateProfileValues } from "@/schema/user/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldError } from "@/components/ui/field";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateUser = useUpdateUser();
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: "", phone: "", deliveryAccess: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        fullName: currentUser.fullName ?? "",
        phone: currentUser.phone ?? "",
        deliveryAccess: currentUser.deliveryAccess ?? "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser, reset]);

  const passwordValue = watch("password");

  async function onSubmit(values: UpdateProfileValues) {
    const userId = user?.id;
    if (!userId) return;
    const body: Record<string, string> = {};
    if (values.fullName) body.fullName = values.fullName;
    if (values.phone !== undefined) body.phone = values.phone ?? "";
    if (values.deliveryAccess !== undefined) body.deliveryAccess = values.deliveryAccess ?? "";
    if (values.password) body.password = values.password;

    try {
      await updateUser.mutateAsync({ id: userId, body });
      toast.success("Profile updated successfully.");
      reset({ ...values, password: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  }

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-muted-foreground text-sm">{currentUser?.email}</p>
      </div>

      <Separator />

      <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          <FieldError errors={[errors.fullName]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          <FieldError errors={[errors.phone]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deliveryAccess">Default delivery address</Label>
          <Input id="deliveryAccess" placeholder="123 Street, City" {...register("deliveryAccess")} />
          <FieldError errors={[errors.deliveryAccess]} />
        </div>

        <Separator />

        <div className="space-y-1.5">
          <Label htmlFor="password">New password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span></Label>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={[errors.password]} />
        </div>

        {passwordValue && (
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            <FieldError errors={[errors.confirmPassword]} />
          </div>
        )}

        <Button type="submit" disabled={!isDirty || updateUser.isPending}>
          {updateUser.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </div>
  );
}
