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
    defaultValues: { firstName: "", lastName: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.firstName ?? "",
        lastName: currentUser.lastName ?? "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser, reset]);

  const passwordValue = watch("password");

  async function onSubmit(values: UpdateProfileValues) {
    const userId = currentUser?.id ?? user?.id;
    if (!userId) return;

    const body: { firstName?: string; lastName?: string; password?: string } = {
      firstName: values.firstName,
      lastName: values.lastName,
    };
    if (values.password) {
      body.password = values.password;
    }

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
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your personal information.</p>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
      >
        {/* Read-only email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-muted-foreground text-sm">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={currentUser?.email ?? ""}
            readOnly
            disabled
            className="cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register("firstName")} />
            <FieldError errors={[errors.firstName]} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register("lastName")} />
            <FieldError errors={[errors.lastName]} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium">Change password</p>
          <p className="text-muted-foreground -mt-2 text-xs">
            Leave blank to keep your current password.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </div>

          {passwordValue && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </div>
          )}
        </div>

        {errors.root && <FieldError errors={[errors.root]} />}

        <Button type="submit" disabled={!isDirty || updateUser.isPending}>
          {updateUser.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </div>
  );
}
