import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import loginSchema from "@/schema/auth/login";
import registerSchema from "@/schema/auth/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { login, register } = useAuthStore();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onLogin(values: LoginValues) {
    setLoginLoading(true);
    try {
      await login(values.email, values.password);
      await navigate({ to: redirect, replace: true });
    } catch {
      loginForm.setError("root", { message: "Invalid email or password. Please try again." });
    } finally {
      setLoginLoading(false);
    }
  }

  async function onRegister(values: RegisterValues) {
    setRegisterLoading(true);
    try {
      await register(values.firstName, values.lastName, values.email, values.password);
      await navigate({ to: redirect, replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
      registerForm.setError("root", { message });
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <Tabs defaultValue="login">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="login" className="flex-1">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={(e) => {
                void loginForm.handleSubmit(onLogin)(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {loginForm.formState.errors.root && (
                <p className="text-sm text-red-500">{loginForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              onSubmit={(e) => {
                void registerForm.handleSubmit(onRegister)(e);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="register-first-name">First Name</Label>
                  <Input
                    id="register-first-name"
                    placeholder="Jane"
                    autoComplete="given-name"
                    {...registerForm.register("firstName")}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-last-name">Last Name</Label>
                  <Input
                    id="register-last-name"
                    placeholder="Doe"
                    autoComplete="family-name"
                    {...registerForm.register("lastName")}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...registerForm.register("confirmPassword")}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {registerForm.formState.errors.root && (
                <p className="text-sm text-red-500">{registerForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={registerLoading}>
                {registerLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
