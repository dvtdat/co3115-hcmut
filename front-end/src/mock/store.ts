import { create } from "zustand";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_CART,
  INITIAL_VOUCHERS,
  INITIAL_REVIEWS,
  type MockCategory,
  type MockProduct,
  type MockUser,
  type MockOrder,
  type MockCart,
  type MockVoucher,
  type MockReview,
} from "./data";

let _seq = 1000;
function nextId(prefix: string) {
  _seq += 1;
  return `${prefix}_${_seq}`;
}

interface MockStore {
  categories: MockCategory[];
  products: MockProduct[];
  users: MockUser[];
  orders: MockOrder[];
  cart: MockCart;
  vouchers: MockVoucher[];
  reviews: MockReview[];

  // Cart
  addCartItem: (productId: string, quantity: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeCartItem: (productId: string) => void;
  clearCart: () => void;

  // Products
  addProduct: (p: Omit<MockProduct, "id" | "_id" | "createdAt" | "updatedAt">) => MockProduct;
  editProduct: (id: string, updates: Partial<MockProduct>) => MockProduct | null;
  removeProduct: (id: string) => void;

  // Categories
  addCategory: (data: { name: string; slug: string; description?: string; imageUrl?: string }) => MockCategory;
  editCategory: (id: string, data: { name?: string; slug?: string; description?: string; imageUrl?: string }) => MockCategory | null;
  removeCategory: (id: string) => void;

  // Orders
  placeOrder: (params: {
    userId: string;
    user: { id: string; firstName: string; lastName: string; email: string };
    shippingAddress: string;
    deliveryOption: string;
    voucherCode?: string;
    notes?: string;
  }) => MockOrder;
  setOrderStatus: (id: string, status: MockOrder["status"]) => MockOrder | null;
  confirmOrderPayment: (id: string) => void;

  // Users
  editUser: (id: string, data: { firstName?: string; lastName?: string; password?: string }) => MockUser | null;
  setUserStatus: (id: string, isActive: boolean) => void;

  // Vouchers
  addVoucher: (data: Omit<MockVoucher, "id" | "_id" | "usedCount" | "createdAt" | "updatedAt" | "isActive"> & { isActive?: boolean }) => MockVoucher;
  editVoucher: (id: string, data: Partial<MockVoucher>) => MockVoucher | null;
  removeVoucher: (id: string) => void;

  // Reviews
  addReview: (data: { rating: number; comment: string; userId: string; userName: string; productId: string; productName: string }) => MockReview;
  editReview: (id: string, data: { rating?: number; comment?: string }) => MockReview | null;
  removeReview: (id: string) => void;
}

export const useMockStore = create<MockStore>()((set, get) => ({
  categories: [...INITIAL_CATEGORIES],
  products: [...INITIAL_PRODUCTS],
  users: [...INITIAL_USERS],
  orders: [...INITIAL_ORDERS],
  cart: { ...INITIAL_CART, items: [...INITIAL_CART.items] },
  vouchers: [...INITIAL_VOUCHERS],
  reviews: [...INITIAL_REVIEWS],

  // ── Cart ────────────────────────────────────────────────────────────────

  addCartItem(productId, quantity) {
    const product = get().products.find((p) => p.id === productId || p._id === productId);
    if (!product) return;
    set((s) => {
      const existing = s.cart.items.find((i) => i.product.id === productId || i.product._id === productId);
      if (existing) {
        return {
          cart: {
            ...s.cart,
            items: s.cart.items.map((i) =>
              i.product.id === productId || i.product._id === productId
                ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock), updatedAt: new Date().toISOString() }
                : i,
            ),
          },
        };
      }
      const now = new Date().toISOString();
      const itemId = nextId("ci");
      return {
        cart: {
          ...s.cart,
          items: [...s.cart.items, { id: itemId, _id: itemId, product, quantity: Math.min(quantity, product.stock), createdAt: now, updatedAt: now }],
        },
      };
    });
  },

  updateCartItem(productId, quantity) {
    set((s) => ({
      cart: {
        ...s.cart,
        items: s.cart.items.map((i) =>
          i.product.id === productId || i.product._id === productId
            ? { ...i, quantity }
            : i,
        ),
      },
    }));
  },

  removeCartItem(productId) {
    set((s) => ({
      cart: {
        ...s.cart,
        items: s.cart.items.filter(
          (i) => i.product.id !== productId && i.product._id !== productId,
        ),
      },
    }));
  },

  clearCart() {
    set((s) => ({ cart: { ...s.cart, items: [] } }));
  },

  // ── Products ─────────────────────────────────────────────────────────────

  addProduct(data) {
    const now = new Date().toISOString();
    const id = nextId("prod");
    const category = get().categories.find((c) => c.id === (data.category as MockCategory).id) ?? data.category as MockCategory;
    const product: MockProduct = { ...data, id, _id: id, category, createdAt: now, updatedAt: now, deletedAt: null };
    set((s) => ({ products: [...s.products, product] }));
    return product;
  },

  editProduct(id, updates) {
    let found: MockProduct | null = null;
    set((s) => {
      const products = s.products.map((p) => {
        if (p.id !== id) return p;
        found = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return found;
      });
      return { products };
    });
    return found;
  },

  removeProduct(id) {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  // ── Categories ───────────────────────────────────────────────────────────

  addCategory(data) {
    const now = new Date().toISOString();
    const id = nextId("cat");
    const cat: MockCategory = { id, _id: id, ...data, createdAt: now, updatedAt: now };
    set((s) => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  editCategory(id, data) {
    let found: MockCategory | null = null;
    set((s) => {
      const categories = s.categories.map((c) => {
        if (c.id !== id) return c;
        found = { ...c, ...data };
        return found;
      });
      return { categories };
    });
    return found;
  },

  removeCategory(id) {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // ── Orders ───────────────────────────────────────────────────────────────

  placeOrder({ userId, user, shippingAddress, deliveryOption, voucherCode, notes }) {
    const { cart, vouchers } = get();
    const now = new Date().toISOString();
    const id = nextId("ord");

    const deliveryFees: Record<string, number> = { standard: 30000, fast: 45000, urgent: 60000 };
    const deliveryFee = deliveryFees[deliveryOption] ?? 30000;
    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    let discount = 0;
    if (voucherCode) {
      const v = vouchers.find((vou) => vou.code === voucherCode.toUpperCase() && vou.isActive);
      if (v) {
        if (v.type === "percent") {
          discount = Math.floor(subtotal * v.value / 100);
          if (v.maxDiscount) discount = Math.min(discount, v.maxDiscount);
        } else {
          discount = v.value;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const totalAmount = subtotal + deliveryFee - discount;

    const order: MockOrder = {
      id,
      _id: id,
      status: "pending",
      totalAmount,
      shippingAddress,
      userId,
      user,
      items: cart.items.map((i) => {
        const itemId = nextId("oi");
        return { id: itemId, _id: itemId, product: i.product, quantity: i.quantity, unitPrice: i.product.price, createdAt: now, updatedAt: now };
      }),
      payment: null,
      deliveryOption,
      notes,
      voucherCode: voucherCode ?? undefined,
      statusHistory: [{ status: "pending", changedAt: now, note: null }],
      createdAt: now,
      updatedAt: now,
    };

    // Deduct stock
    set((s) => ({
      orders: [...s.orders, order],
      cart: { ...s.cart, items: [] },
      products: s.products.map((p) => {
        const item = cart.items.find((i) => i.product.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      }),
    }));

    return order;
  },

  setOrderStatus(id, status) {
    let found: MockOrder | null = null;
    set((s) => {
      const orders = s.orders.map((o) => {
        if (o.id !== id) return o;
        found = { ...o, status, updatedAt: new Date().toISOString() };
        return found;
      });
      return { orders };
    });
    return found;
  },

  confirmOrderPayment(id) {
    const now = new Date().toISOString();
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              payment: { confirmed: true, paidAt: now, bankName: "Vietcombank", bankAbbreviation: "VCB", amount: o.totalAmount, confirmedAt: now },
              status: "confirmed",
              statusHistory: [...(o.statusHistory ?? []), { status: "confirmed", changedAt: now, note: "Payment confirmed" }],
              updatedAt: now,
            }
          : o,
      ),
    }));
  },

  // ── Users ─────────────────────────────────────────────────────────────────

  editUser(id, data) {
    let found: MockUser | null = null;
    set((s) => {
      const users = s.users.map((u) => {
        if (u.id !== id) return u;
        found = { ...u, ...data };
        return found;
      });
      return { users };
    });
    return found;
  },

  setUserStatus(id, isActive) {
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, isActive } : u)),
    }));
  },

  // ── Vouchers ─────────────────────────────────────────────────────────────

  addVoucher(data) {
    const id = nextId("vou");
    const now = new Date().toISOString();
    const v: MockVoucher = { usedCount: 0, ...data, isActive: data.isActive ?? true, id, _id: id, createdAt: now, updatedAt: now };
    set((s) => ({ vouchers: [...s.vouchers, v] }));
    return v;
  },

  editVoucher(id, data) {
    let found: MockVoucher | null = null;
    set((s) => {
      const vouchers = s.vouchers.map((v) => {
        if (v.id !== id && v._id !== id) return v;
        found = { ...v, ...data };
        return found;
      });
      return { vouchers };
    });
    return found;
  },

  removeVoucher(id) {
    set((s) => ({ vouchers: s.vouchers.filter((v) => v.id !== id && v._id !== id) }));
  },

  // ── Reviews ──────────────────────────────────────────────────────────────

  addReview({ rating, comment, userId, userName, productId, productName }) {
    const id = nextId("rev");
    const now = new Date().toISOString();
    const [firstName = "", lastName = ""] = userName.split(" ");
    const review: MockReview = {
      id,
      rating,
      comment,
      user: { id: userId, firstName, lastName },
      product: { id: productId, name: productName },
      createdAt: now,
    };
    set((s) => ({ reviews: [...s.reviews, review] }));
    return review;
  },

  editReview(id, data) {
    let found: MockReview | null = null;
    set((s) => {
      const reviews = s.reviews.map((r) => {
        if (r.id !== id) return r;
        found = { ...r, ...data };
        return found;
      });
      return { reviews };
    });
    return found;
  },

  removeReview(id) {
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
  },
}));
