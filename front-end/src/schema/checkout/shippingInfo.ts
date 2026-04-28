import { z } from "zod";

export const RECEIVING_METHODS = ["delivery", "pickup"] as const;
export type ReceivingMethod = (typeof RECEIVING_METHODS)[number];

export const shippingInfoSchema = z
  .object({
    receivingMethod: z.enum(RECEIVING_METHODS),
    shippingAddress: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.receivingMethod === "delivery" && !val.shippingAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shippingAddress"],
        message: "Shipping address is required for delivery",
      });
    }
  });

export type ShippingInfoValues = z.infer<typeof shippingInfoSchema>;
