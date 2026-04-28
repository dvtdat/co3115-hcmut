import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    try {
      await register.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      toast.success("Account created! Please log in.");
      void navigate({ to: "/login", search: { redirect: "/" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Create account</h1>

      <form
        onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Nguyen Van A" {...field("fullName")} />
          <FieldError errors={[errors.fullName]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...field("email")} />
          <FieldError errors={[errors.email]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="phone" type="tel" placeholder="0901234567" {...field("phone")} />
          <FieldError errors={[errors.phone]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...field("password")} />
          <FieldError errors={[errors.password]} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...field("confirmPassword")} />
          <FieldError errors={[errors.confirmPassword]} />
        </div>

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" search={{ redirect: "/" }} className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
