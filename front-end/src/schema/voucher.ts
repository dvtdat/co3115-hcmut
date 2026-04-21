export const VOUCHER_TYPES = ["percent", "fixed"] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];
