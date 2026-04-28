import { z } from "zod";

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().optional(),
    deliveryAccess: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .or(z.literal(""))
      .optional(),
    confirmPassword: z.string().or(z.literal("")).optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
