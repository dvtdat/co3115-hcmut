import { useState } from "react";

const MOCK_REPLIES: Record<string, string> = {
  default: "Thanks for your message! I'm here to help you find the best healthy food products. Try asking about our products, delivery options, or current vouchers.",
  price: "Our products are priced competitively. Most vegetables start from 25,000 ₫ and premium items like salmon go up to 180,000 ₫.",
  delivery: "We offer Standard Delivery (3–5 business days, 30,000 ₫) and Express Delivery (1–2 business days, 60,000 ₫).",
  voucher: "Current active vouchers: WELCOME10 (10% off, max 50,000 ₫) and SAVE50K (50,000 ₫ off orders over 200,000 ₫).",
  organic: "All our vegetables and dairy products are certified organic, sourced from trusted local farms.",
  stock: "Most items are in stock. Baby Spinach is currently out of stock and Avocados are running low (only 3 left!).",
};

function getMockReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) return MOCK_REPLIES.price!;
  if (lower.includes("deliver") || lower.includes("shipping")) return MOCK_REPLIES.delivery!;
  if (lower.includes("voucher") || lower.includes("discount") || lower.includes("coupon")) return MOCK_REPLIES.voucher!;
  if (lower.includes("organic") || lower.includes("fresh")) return MOCK_REPLIES.organic!;
  if (lower.includes("stock") || lower.includes("available")) return MOCK_REPLIES.stock!;
  return MOCK_REPLIES.default!;
}

export function useSendChatMessage() {
  const [isPending, setIsPending] = useState(false);

  async function mutateAsync(message: string) {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 700));
    const reply = getMockReply(message);
    setIsPending(false);
    return { reply };
  }

  return { mutateAsync, isPending };
}
