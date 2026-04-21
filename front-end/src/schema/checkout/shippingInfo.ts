import { z } from "zod";

export const DELIVERY_OPTIONS = ["standard", "fast", "urgent"] as const;
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number];

export const shippingInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(9, "Phone number must be at least 9 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  notes: z.string().optional(),
  deliveryOption: z.enum(DELIVERY_OPTIONS),
});

export type ShippingInfoValues = z.infer<typeof shippingInfoSchema>;
