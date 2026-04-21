// Static initial mock data for the HealthyFood demo app.

export interface MockCategory {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MockProduct {
  id: string;
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  viewCount: number;
  category: MockCategory;
  keyCharacteristics?: string[];
  weight?: number;
  weightUnit?: string;
  calories?: number;
  healthScore?: number;
  shelfLife?: string;
  deletedAt?: null;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MockCartItem {
  id: string;
  _id: string;
  product: MockProduct;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockCart {
  id: string;
  items: MockCartItem[];
}

export interface MockStatusHistoryEntry {
  status: string;
  changedAt: string;
  note?: string | null;
}

export interface MockPayment {
  confirmed?: boolean;
  paidAt?: string;
  bankName?: string;
  bankAbbreviation?: string;
  accountNumber?: string;
  amount?: number;
  confirmedAt?: string;
}

export interface MockOrderItem {
  id: string;
  _id: string;
  product: MockProduct;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockOrder {
  id: string;
  _id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  shippingAddress: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  items: MockOrderItem[];
  payment?: MockPayment | null;
  deliveryOption?: string;
  notes?: string;
  voucherCode?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  statusHistory: MockStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface MockVoucher {
  id: string;
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockReview {
  id: string;
  rating: number;
  comment: string;
  user: { id: string; firstName: string; lastName: string };
  product: { id: string; name: string };
  createdAt: string;
}

// ── Categories ──────────────────────────────────────────────────────────────

const CAT1: MockCategory = {
  id: "cat-fruits",
  _id: "cat-fruits",
  name: "Fruits & Vegetables",
  slug: "fruits-vegetables",
  description: "Fresh, organic produce sourced daily",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const CAT2: MockCategory = {
  id: "cat-dairy",
  _id: "cat-dairy",
  name: "Dairy & Eggs",
  slug: "dairy-eggs",
  description: "Farm-fresh dairy and free-range eggs",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const CAT3: MockCategory = {
  id: "cat-meat",
  _id: "cat-meat",
  name: "Meat & Seafood",
  slug: "meat-seafood",
  description: "Premium quality protein, ethically sourced",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const CAT4: MockCategory = {
  id: "cat-pantry",
  _id: "cat-pantry",
  name: "Pantry & Grains",
  slug: "pantry-grains",
  description: "Wholesome staples and superfoods",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const INITIAL_CATEGORIES: MockCategory[] = [CAT1, CAT2, CAT3, CAT4];

// ── Products ────────────────────────────────────────────────────────────────

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: "prod-001", _id: "prod-001",
    name: "Organic Broccoli", slug: "organic-broccoli",
    price: 35000, stock: 50, viewCount: 142,
    description: "Crisp, vibrant organic broccoli florets packed with vitamins C and K. Grown without pesticides.",
    category: CAT1,
    keyCharacteristics: ["Certified Organic", "High Vitamin C", "Rich in Fibre"],
    weight: 500, weightUnit: "g", calories: 55, healthScore: 9.2, shelfLife: "5 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-05T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-002", _id: "prod-002",
    name: "Cherry Tomatoes", slug: "cherry-tomatoes",
    price: 45000, stock: 30, viewCount: 98,
    description: "Sweet, juicy cherry tomatoes bursting with flavour. Perfect for salads and snacking.",
    category: CAT1,
    keyCharacteristics: ["Antioxidant-Rich", "Non-GMO", "Vine-Ripened"],
    weight: 400, weightUnit: "g", calories: 35, healthScore: 8.5, shelfLife: "7 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-05T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-003", _id: "prod-003",
    name: "Fresh Salmon Fillet", slug: "fresh-salmon-fillet",
    price: 180000, stock: 15, viewCount: 231,
    description: "Premium Atlantic salmon fillet, skin-on. Rich in Omega-3 fatty acids for heart health.",
    category: CAT3,
    keyCharacteristics: ["Omega-3 Rich", "Wild-Caught", "Sashimi Grade"],
    weight: 300, weightUnit: "g", calories: 208, healthScore: 9.5, shelfLife: "2 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-10T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-004", _id: "prod-004",
    name: "Free-Range Eggs (12 pack)", slug: "free-range-eggs",
    price: 65000, stock: 40, viewCount: 189,
    description: "A dozen large eggs from free-range hens raised on organic feed. Rich yolks, superior taste.",
    category: CAT2,
    keyCharacteristics: ["Free-Range", "Hormone-Free", "High Protein"],
    weight: 700, weightUnit: "g", calories: 78, healthScore: 8.8, shelfLife: "21 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-05T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-005", _id: "prod-005",
    name: "Organic Greek Yogurt", slug: "organic-greek-yogurt",
    price: 55000, stock: 25, viewCount: 76,
    description: "Thick, creamy Greek yogurt made from organic whole milk. Packed with probiotics and protein.",
    category: CAT2,
    keyCharacteristics: ["Probiotic", "High Protein", "Certified Organic"],
    weight: 400, weightUnit: "g", calories: 100, healthScore: 8.7, shelfLife: "14 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-08T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-006", _id: "prod-006",
    name: "Brown Rice (1 kg)", slug: "brown-rice-1kg",
    price: 30000, stock: 80, viewCount: 55,
    description: "Whole grain brown rice with bran intact for maximum nutrition. High in fibre and magnesium.",
    category: CAT4,
    keyCharacteristics: ["Whole Grain", "Low GI", "Gluten-Free"],
    weight: 1000, weightUnit: "g", calories: 216, healthScore: 8.0, shelfLife: "12 months (cool dry place)",
    deletedAt: null, createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-007", _id: "prod-007",
    name: "Quinoa (500 g)", slug: "quinoa-500g",
    price: 120000, stock: 20, viewCount: 112,
    description: "Premium white quinoa — a complete protein source with all nine essential amino acids.",
    category: CAT4,
    keyCharacteristics: ["Complete Protein", "Gluten-Free", "Superfood"],
    weight: 500, weightUnit: "g", calories: 222, healthScore: 9.0, shelfLife: "24 months (sealed)",
    deletedAt: null, createdAt: "2026-01-06T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-008", _id: "prod-008",
    name: "Fresh Avocado", slug: "fresh-avocado",
    price: 85000, stock: 3, viewCount: 167,
    description: "Creamy, ripe Hass avocados. Excellent source of healthy monounsaturated fats.",
    category: CAT1,
    keyCharacteristics: ["Healthy Fats", "Potassium-Rich", "Keto-Friendly"],
    calories: 160, healthScore: 8.9, shelfLife: "3 days (room temp)",
    deletedAt: null, createdAt: "2026-01-12T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-009", _id: "prod-009",
    name: "Organic Whole Milk (1 L)", slug: "organic-whole-milk-1l",
    price: 40000, stock: 60, viewCount: 88,
    description: "Full-fat organic milk from grass-fed cows. Rich in calcium, vitamin D and natural CLA.",
    category: CAT2,
    keyCharacteristics: ["Grass-Fed", "Certified Organic", "High Calcium"],
    weight: 1000, weightUnit: "ml", calories: 149, healthScore: 7.8, shelfLife: "10 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-05T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-010", _id: "prod-010",
    name: "Chicken Breast (500 g)", slug: "chicken-breast-500g",
    price: 95000, stock: 30, viewCount: 145,
    description: "Skinless, boneless chicken breast from free-range birds. High-protein, low-fat cut.",
    category: CAT3,
    keyCharacteristics: ["Free-Range", "High Protein", "Low Fat"],
    weight: 500, weightUnit: "g", calories: 165, healthScore: 8.3, shelfLife: "3 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-10T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-011", _id: "prod-011",
    name: "Baby Spinach", slug: "baby-spinach",
    price: 25000, stock: 0, viewCount: 63,
    description: "Tender baby spinach leaves, triple-washed and ready to eat. Loaded with iron and folate.",
    category: CAT1,
    keyCharacteristics: ["Ready to Eat", "Iron-Rich", "Low Calorie"],
    weight: 200, weightUnit: "g", calories: 23, healthScore: 9.4, shelfLife: "4 days (refrigerated)",
    deletedAt: null, createdAt: "2026-01-07T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "prod-012", _id: "prod-012",
    name: "Oat Granola (400 g)", slug: "oat-granola-400g",
    price: 75000, stock: 45, viewCount: 91,
    description: "Crunchy oat granola with honey, almonds and dried berries. No artificial additives.",
    category: CAT4,
    keyCharacteristics: ["No Artificial Flavours", "High Fibre", "Natural Sweetener"],
    weight: 400, weightUnit: "g", calories: 450, healthScore: 7.5, shelfLife: "6 months (sealed)",
    deletedAt: null, createdAt: "2026-01-08T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z",
  },
];

// ── Users ───────────────────────────────────────────────────────────────────

export const MOCK_CREDENTIALS: Record<string, { id: string; role: string }> = {
  "admin@test.com": { id: "usr_admin", role: "admin" },
  "user@test.com": { id: "usr_001", role: "user" },
};

export const MOCK_PASSWORDS: Record<string, string> = {
  "admin@test.com": "admin123",
  "user@test.com": "user123",
};

export const INITIAL_USERS: MockUser[] = [
  { id: "usr_admin", _id: "usr_admin", email: "admin@test.com", firstName: "Admin", lastName: "User", role: "admin", isActive: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "usr_001", _id: "usr_001", email: "user@test.com", firstName: "John", lastName: "Doe", role: "user", isActive: true, createdAt: "2026-01-15T00:00:00.000Z", updatedAt: "2026-01-15T00:00:00.000Z" },
  { id: "usr_002", _id: "usr_002", email: "jane@example.com", firstName: "Jane", lastName: "Smith", role: "user", isActive: true, createdAt: "2026-02-03T00:00:00.000Z", updatedAt: "2026-02-03T00:00:00.000Z" },
  { id: "usr_003", _id: "usr_003", email: "bob@example.com", firstName: "Bob", lastName: "Johnson", role: "user", isActive: false, createdAt: "2026-02-20T00:00:00.000Z", updatedAt: "2026-02-20T00:00:00.000Z" },
  { id: "usr_004", _id: "usr_004", email: "alice@example.com", firstName: "Alice", lastName: "Williams", role: "user", isActive: true, createdAt: "2026-03-10T00:00:00.000Z", updatedAt: "2026-03-10T00:00:00.000Z" },
];

// ── Cart ────────────────────────────────────────────────────────────────────

const NOW = "2026-04-21T00:00:00.000Z";

export const INITIAL_CART: MockCart = {
  id: "cart_001",
  items: [
    { id: "ci-001", _id: "ci-001", product: INITIAL_PRODUCTS[0]!, quantity: 2, createdAt: NOW, updatedAt: NOW },
    { id: "ci-002", _id: "ci-002", product: INITIAL_PRODUCTS[3]!, quantity: 1, createdAt: NOW, updatedAt: NOW },
  ],
};

// ── Orders ──────────────────────────────────────────────────────────────────

const USR1 = { id: "usr_001", firstName: "John", lastName: "Doe", email: "user@test.com" };
const USR2 = { id: "usr_002", firstName: "Jane", lastName: "Smith", email: "jane@example.com" };
const USR3 = { id: "usr_003", firstName: "Bob", lastName: "Johnson", email: "bob@example.com" };
const USR4 = { id: "usr_004", firstName: "Alice", lastName: "Williams", email: "alice@example.com" };

function makeOrderItem(product: MockProduct, quantity: number): MockOrderItem {
  return { id: `oi-${product.id}`, _id: `oi-${product.id}`, product, quantity, unitPrice: product.price, createdAt: NOW, updatedAt: NOW };
}

function buildStatusHistory(status: MockOrder["status"], createdAt: string, updatedAt: string): MockStatusHistoryEntry[] {
  const hist: MockStatusHistoryEntry[] = [{ status: "pending", changedAt: createdAt, note: null }];
  if (status === "cancelled") {
    hist.push({ status: "cancelled", changedAt: updatedAt, note: null });
    return hist;
  }
  if (status === "confirmed" || status === "shipped" || status === "delivered") {
    hist.push({ status: "confirmed", changedAt: updatedAt, note: null });
  }
  if (status === "shipped" || status === "delivered") {
    hist.push({ status: "shipped", changedAt: updatedAt, note: null });
  }
  if (status === "delivered") {
    hist.push({ status: "delivered", changedAt: updatedAt, note: null });
  }
  return hist;
}

const confirmedPayment = (amount: number, paidAt: string): MockPayment => ({
  confirmed: true,
  paidAt,
  bankName: "MB Bank",
  bankAbbreviation: "MB",
  amount,
  confirmedAt: paidAt,
});

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "ord_001", _id: "ord_001", status: "pending", totalAmount: 165000,
    shippingAddress: "John Doe - 0901234567 - 123 Nguyen Hue, District 1, Ho Chi Minh City",
    userId: "usr_001", user: USR1,
    items: [makeOrderItem(INITIAL_PRODUCTS[0]!, 2), makeOrderItem(INITIAL_PRODUCTS[3]!, 1)],
    payment: null, deliveryOption: "standard",
    createdAt: "2026-04-18T10:30:00.000Z", updatedAt: "2026-04-18T10:30:00.000Z",
    statusHistory: buildStatusHistory("pending", "2026-04-18T10:30:00.000Z", "2026-04-18T10:30:00.000Z"),
  },
  {
    id: "ord_002", _id: "ord_002", status: "delivered", totalAmount: 320000,
    shippingAddress: "John Doe - 0901234567 - 123 Nguyen Hue, District 1, Ho Chi Minh City",
    userId: "usr_001", user: USR1,
    items: [makeOrderItem(INITIAL_PRODUCTS[2]!, 1), makeOrderItem(INITIAL_PRODUCTS[4]!, 2)],
    payment: confirmedPayment(320000, "2026-04-10T14:00:00.000Z"),
    deliveryOption: "express",
    createdAt: "2026-04-09T09:00:00.000Z", updatedAt: "2026-04-15T16:00:00.000Z",
    statusHistory: buildStatusHistory("delivered", "2026-04-09T09:00:00.000Z", "2026-04-15T16:00:00.000Z"),
  },
  {
    id: "ord_003", _id: "ord_003", status: "cancelled", totalAmount: 125000,
    shippingAddress: "John Doe - 0901234567 - 123 Nguyen Hue, District 1, Ho Chi Minh City",
    userId: "usr_001", user: USR1,
    items: [makeOrderItem(INITIAL_PRODUCTS[9]!, 1)],
    payment: null, deliveryOption: "standard",
    createdAt: "2026-04-02T11:00:00.000Z", updatedAt: "2026-04-03T09:00:00.000Z",
    statusHistory: buildStatusHistory("cancelled", "2026-04-02T11:00:00.000Z", "2026-04-03T09:00:00.000Z"),
  },
  {
    id: "ord_004", _id: "ord_004", status: "confirmed", totalAmount: 300000,
    shippingAddress: "Jane Smith - 0902345678 - 456 Le Loi, District 3, Ho Chi Minh City",
    userId: "usr_002", user: USR2,
    items: [makeOrderItem(INITIAL_PRODUCTS[6]!, 1), makeOrderItem(INITIAL_PRODUCTS[11]!, 2)],
    payment: confirmedPayment(300000, "2026-04-17T10:00:00.000Z"),
    deliveryOption: "standard",
    createdAt: "2026-04-17T08:00:00.000Z", updatedAt: "2026-04-17T12:00:00.000Z",
    statusHistory: buildStatusHistory("confirmed", "2026-04-17T08:00:00.000Z", "2026-04-17T12:00:00.000Z"),
  },
  {
    id: "ord_005", _id: "ord_005", status: "shipped", totalAmount: 240000,
    shippingAddress: "Bob Johnson - 0903456789 - 789 Tran Hung Dao, District 5, Ho Chi Minh City",
    userId: "usr_003", user: USR3,
    items: [makeOrderItem(INITIAL_PRODUCTS[3]!, 2), makeOrderItem(INITIAL_PRODUCTS[8]!, 2)],
    payment: confirmedPayment(240000, "2026-04-15T11:30:00.000Z"),
    deliveryOption: "fast",
    trackingNumber: "VN123456789",
    courierName: "Giao Hang Nhanh",
    createdAt: "2026-04-15T09:00:00.000Z", updatedAt: "2026-04-17T14:00:00.000Z",
    statusHistory: buildStatusHistory("shipped", "2026-04-15T09:00:00.000Z", "2026-04-17T14:00:00.000Z"),
  },
  {
    id: "ord_006", _id: "ord_006", status: "delivered", totalAmount: 210000,
    shippingAddress: "Alice Williams - 0904567890 - 12 Hai Ba Trung, District 1, Ho Chi Minh City",
    userId: "usr_004", user: USR4,
    items: [makeOrderItem(INITIAL_PRODUCTS[2]!, 1)],
    payment: confirmedPayment(210000, "2026-04-05T15:00:00.000Z"),
    deliveryOption: "standard",
    createdAt: "2026-04-04T10:00:00.000Z", updatedAt: "2026-04-10T12:00:00.000Z",
    statusHistory: buildStatusHistory("delivered", "2026-04-04T10:00:00.000Z", "2026-04-10T12:00:00.000Z"),
  },
];

// ── Vouchers ────────────────────────────────────────────────────────────────

export const INITIAL_VOUCHERS: MockVoucher[] = [
  {
    id: "vou_001", _id: "vou_001", code: "WELCOME10", type: "percent", value: 10,
    maxDiscount: 50000, usageLimit: 100, usedCount: 23, perUserLimit: 1, isActive: true,
    validFrom: "2026-01-01T00:00:00.000Z", validTo: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "vou_002", _id: "vou_002", code: "SAVE50K", type: "fixed", value: 50000,
    minOrderAmount: 200000, usageLimit: 50, usedCount: 12, isActive: true,
    validFrom: "2026-03-01T00:00:00.000Z", validTo: "2026-06-30T23:59:59.000Z",
    createdAt: "2026-03-01T00:00:00.000Z", updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "vou_003", _id: "vou_003", code: "SUMMER20", type: "percent", value: 20,
    maxDiscount: 100000, usedCount: 5, isActive: false,
    validFrom: "2025-06-01T00:00:00.000Z", validTo: "2025-08-31T23:59:59.000Z",
    createdAt: "2025-05-15T00:00:00.000Z", updatedAt: "2025-05-15T00:00:00.000Z",
  },
];

// ── Reviews ─────────────────────────────────────────────────────────────────

export const INITIAL_REVIEWS: MockReview[] = [
  { id: "rev_001", rating: 5, comment: "Absolutely fresh! The broccoli was vibrant green and crispy. Will order again.", user: { id: "usr_002", firstName: "Jane", lastName: "Smith" }, product: { id: "prod-001", name: "Organic Broccoli" }, createdAt: "2026-04-02T10:00:00.000Z" },
  { id: "rev_002", rating: 4, comment: "Eggs were very fresh with rich orange yolks. Great quality for the price.", user: { id: "usr_003", firstName: "Bob", lastName: "Johnson" }, product: { id: "prod-004", name: "Free-Range Eggs (12 pack)" }, createdAt: "2026-03-28T14:00:00.000Z" },
  { id: "rev_003", rating: 5, comment: "Sashimi-grade quality. The salmon was buttery and absolutely delicious.", user: { id: "usr_004", firstName: "Alice", lastName: "Williams" }, product: { id: "prod-003", name: "Fresh Salmon Fillet" }, createdAt: "2026-04-11T09:00:00.000Z" },
  { id: "rev_004", rating: 4, comment: "Good Greek yogurt, thick and creamy. Slightly tart which I love.", user: { id: "usr_001", firstName: "John", lastName: "Doe" }, product: { id: "prod-005", name: "Organic Greek Yogurt" }, createdAt: "2026-04-05T11:00:00.000Z" },
];

// ── Delivery options ─────────────────────────────────────────────────────────
// Keys must match DELIVERY_OPTIONS in src/schema/checkout/shippingInfo.ts

export const DELIVERY_OPTIONS = {
  standard: { label: "Standard Delivery", fee: 30000, estimatedDays: "3–5 business days", description: "Delivered to your door" },
  fast: { label: "Fast Delivery", fee: 45000, estimatedDays: "2–3 business days", description: "Priority dispatch" },
  urgent: { label: "Urgent Delivery", fee: 70000, estimatedDays: "Next business day", description: "Same-day processing" },
};

export type DeliveryOptionKey = keyof typeof DELIVERY_OPTIONS;
