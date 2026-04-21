import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
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
