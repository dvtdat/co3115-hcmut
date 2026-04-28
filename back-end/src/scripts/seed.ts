import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { config } from 'dotenv';
import { User, UserRole } from '../entities/user/user.entity';
import { Admin, AdminRole } from '../entities/admin/admin.entity';
import { Customer } from '../entities/customer/customer.entity';
import { Category } from '../entities/category/category.entity';
import { Product } from '../entities/product/product.entity';
import type { ProductItemStatus } from '../entities/product-item/product-item.entity';
import { ProductItem } from '../entities/product-item/product-item.entity';
import { ShoppingCart } from '../entities/shopping-cart/shopping-cart.entity';
import { CartItem } from '../entities/cart-item/cart-item.entity';
import { Order } from '../entities/order/order.entity';
import { OrderDetail } from '../entities/order-detail/order-detail.entity';
import { hashPassword } from '../common/utils/password.util';

config();

// ── Credentials ──────────────────────────────────────────────────────────────

const ADMIN = { email: 'admin@co3115.hcmut.edu.vn', password: 'Admin@123' };

const DEMO_USER = {
  email: 'user@co3115.hcmut.edu.vn',
  password: 'User@123',
  fullName: 'Demo User',
};

// ── Catalog data ──────────────────────────────────────────────────────────────

const CATALOG: {
  category: { name: string; description: string };
  products: {
    name: string;
    description: string;
    basePrice: number;
    stock: number;
    defaultImage?: string;
    items: { specificPrice: number; status?: ProductItemStatus }[];
  }[];
}[] = [
  {
    category: {
      name: 'Laptops',
      description: 'Portable computers and ultrabooks',
    },
    products: [
      {
        name: 'MacBook Air M2',
        description:
          'Apple MacBook Air with M2 chip, 8-core CPU, 8-core GPU, 8GB RAM, 256GB SSD.',
        basePrice: 27990000,
        stock: 20,
        defaultImage:
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606',
        items: [{ specificPrice: 27990000 }, { specificPrice: 32990000 }],
      },
      {
        name: 'Dell XPS 15',
        description:
          'Dell XPS 15 with Intel Core i7-13700H, 16GB DDR5, 512GB SSD, OLED 3.5K display.',
        basePrice: 38500000,
        stock: 15,
        items: [{ specificPrice: 38500000 }, { specificPrice: 44500000 }],
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon',
        description:
          'Business ultrabook — Intel Core i5-1335U, 16GB, 512GB SSD, 14" IPS.',
        basePrice: 35000000,
        stock: 10,
        items: [{ specificPrice: 35000000 }],
      },
      {
        name: 'ASUS ROG Zephyrus G14',
        description:
          'Gaming laptop — AMD Ryzen 9 7940HS, RTX 4060 8GB, 16GB DDR5, 1TB SSD.',
        basePrice: 42000000,
        stock: 8,
        items: [{ specificPrice: 42000000 }, { specificPrice: 49000000 }],
      },
    ],
  },
  {
    category: {
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
    },
    products: [
      {
        name: 'iPhone 15 Pro',
        description:
          'Apple iPhone 15 Pro — A17 Pro chip, 48MP camera system, titanium design.',
        basePrice: 28990000,
        stock: 30,
        items: [
          { specificPrice: 28990000 }, // 128GB
          { specificPrice: 33990000 }, // 256GB
          { specificPrice: 38990000 }, // 512GB
        ],
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description:
          'Samsung Galaxy S24 Ultra — Snapdragon 8 Gen 3, 200MP camera, built-in S Pen.',
        basePrice: 31990000,
        stock: 25,
        items: [
          { specificPrice: 31990000 }, // 256GB
          { specificPrice: 37990000 }, // 512GB
        ],
      },
      {
        name: 'Google Pixel 8',
        description:
          'Google Pixel 8 — Google Tensor G3, 50MP camera, 7 years of OS updates.',
        basePrice: 16990000,
        stock: 20,
        items: [{ specificPrice: 16990000 }, { specificPrice: 19990000 }],
      },
      {
        name: 'Xiaomi 14',
        description:
          'Xiaomi 14 — Snapdragon 8 Gen 3, Leica optics, 4610mAh, 90W HyperCharge.',
        basePrice: 19990000,
        stock: 18,
        items: [{ specificPrice: 19990000 }, { specificPrice: 22990000 }],
      },
    ],
  },
  {
    category: { name: 'Tablets', description: 'Tablets and e-readers' },
    products: [
      {
        name: 'iPad Air M2',
        description:
          'Apple iPad Air with M2 chip, 11-inch Liquid Retina display, USB-C.',
        basePrice: 18990000,
        stock: 15,
        items: [
          { specificPrice: 18990000 }, // 128GB Wi-Fi
          { specificPrice: 22990000 }, // 256GB Wi-Fi
        ],
      },
      {
        name: 'Samsung Galaxy Tab S9',
        description:
          'Samsung Galaxy Tab S9 — Snapdragon 8 Gen 2, 11" AMOLED, S Pen included.',
        basePrice: 20990000,
        stock: 12,
        items: [{ specificPrice: 20990000 }, { specificPrice: 25990000 }],
      },
    ],
  },
  {
    category: {
      name: 'Accessories',
      description: 'Peripherals, cables, and add-ons',
    },
    products: [
      {
        name: 'Apple AirPods Pro 2',
        description:
          'Active noise cancellation, Adaptive Audio, MagSafe charging case.',
        basePrice: 6490000,
        stock: 50,
        items: [{ specificPrice: 6490000 }],
      },
      {
        name: 'Sony WH-1000XM5',
        description:
          'Industry-leading noise cancellation, 30-hour battery, multipoint Bluetooth.',
        basePrice: 8490000,
        stock: 30,
        items: [{ specificPrice: 8490000 }],
      },
      {
        name: 'Logitech MX Master 3S',
        description:
          'Advanced wireless mouse — MagSpeed scroll, 8000 DPI, USB-C, quiet clicks.',
        basePrice: 2290000,
        stock: 40,
        items: [{ specificPrice: 2290000 }],
      },
      {
        name: 'Samsung 65W USB-C Charger',
        description:
          'Compact 65W GaN charger — dual USB-C ports, fast charging.',
        basePrice: 890000,
        stock: 100,
        items: [{ specificPrice: 890000 }],
      },
      {
        name: 'Anker USB-C Hub 7-in-1',
        description:
          'USB-C Hub with 4K HDMI, 100W PD, 2× USB-A, SD/microSD, USB-C data.',
        basePrice: 990000,
        stock: 60,
        items: [{ specificPrice: 990000 }],
      },
    ],
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const orm = await MikroORM.init<MongoDriver>({
    driver: MongoDriver,
    clientUrl: process.env.DATABASE_URL ?? 'mongodb://localhost:27017',
    dbName: process.env.DATABASE_NAME ?? 'co3115-hcmut',
    entities: [
      User,
      Admin,
      Customer,
      Category,
      Product,
      ProductItem,
      ShoppingCart,
      CartItem,
      Order,
      OrderDetail,
    ],
    allowGlobalContext: true,
  });

  const em = orm.em.fork();
  console.log('🌱 Starting seed...\n');

  // ── Admin ──────────────────────────────────────────────────────────────────

  let adminUser = await em.findOne(User, { email: ADMIN.email });
  let admin: Admin | null = null;

  if (!adminUser) {
    const hashed = await hashPassword(ADMIN.password);
    adminUser = new User(ADMIN.email, hashed, UserRole.ADMIN);
    em.persist(adminUser);
    admin = new Admin(adminUser, AdminRole.SUPER_ADMIN);
    em.persist(admin);
    await em.flush();
    console.log(`✅ Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  } else {
    admin = await em.findOne(Admin, { user: adminUser._id });
    console.log(`⏭  Admin already exists, skipping.`);
  }

  if (!admin) {
    console.error('❌ Could not find/create admin entity.');
    await orm.close();
    process.exit(1);
  }

  // ── Demo user ──────────────────────────────────────────────────────────────

  let demoUser = await em.findOne(User, { email: DEMO_USER.email });
  if (!demoUser) {
    const hashed = await hashPassword(DEMO_USER.password);
    demoUser = new User(DEMO_USER.email, hashed, UserRole.CUSTOMER);
    em.persist(demoUser);
    const customer = new Customer(demoUser, DEMO_USER.fullName);
    em.persist(customer);
    await em.flush();
    console.log(
      `✅ Demo user created: ${DEMO_USER.email} / ${DEMO_USER.password}`,
    );
  } else {
    console.log(`⏭  Demo user already exists, skipping.`);
  }

  // ── Categories + Products + ProductItems ───────────────────────────────────

  let productsCreated = 0;
  let itemsCreated = 0;

  for (const entry of CATALOG) {
    let category = await em.findOne(Category, {
      categoryName: entry.category.name,
    });
    if (!category) {
      category = new Category(entry.category.name, entry.category.description);
      em.persist(category);
      await em.flush();
      console.log(`✅ Category: ${entry.category.name}`);
    } else {
      console.log(`⏭  Category "${entry.category.name}" already exists.`);
    }

    for (const p of entry.products) {
      const existing = await em.findOne(Product, { productName: p.name });
      if (existing) {
        console.log(`⏭  Product "${p.name}" already exists.`);
        continue;
      }

      const product = new Product(p.name, p.basePrice, category, admin);
      product.description = p.description;
      product.stockQuantity = p.stock;
      if (p.defaultImage) product.defaultImage = p.defaultImage;
      em.persist(product);
      await em.flush();

      for (const it of p.items) {
        const item = new ProductItem(it.specificPrice, product);
        if (it.status) item.status = it.status;
        em.persist(item);
        itemsCreated++;
      }
      await em.flush();

      productsCreated++;
      console.log(
        `  ✅ Product: ${p.name} (${p.items.length} variant${p.items.length > 1 ? 's' : ''})`,
      );
    }
  }

  console.log(`\n🎉 Seed completed.`);
  console.log(`   Products created : ${productsCreated}`);
  console.log(`   Variants created : ${itemsCreated}`);
  await orm.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
