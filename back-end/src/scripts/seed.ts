import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { config } from 'dotenv';
import { User, UserRole } from '../entities/user/user.entity';
import { Admin, AdminRole } from '../entities/admin/admin.entity';
import { Customer } from '../entities/customer/customer.entity';
import { Category } from '../entities/category/category.entity';
import { Product } from '../entities/product/product.entity';
import { ProductItem } from '../entities/product-item/product-item.entity';
import { ShoppingCart } from '../entities/shopping-cart/shopping-cart.entity';
import { CartItem } from '../entities/cart-item/cart-item.entity';
import { Order } from '../entities/order/order.entity';
import { OrderDetail } from '../entities/order-detail/order-detail.entity';
import { hashPassword } from '../common/utils/password.util';

config();

const ADMIN = {
  email: 'admin@co3115.hcmut.edu.vn',
  password: 'Admin@123',
};

const CATEGORIES = [
  { name: 'Laptops', description: 'Portable computers and ultrabooks' },
  { name: 'Smartphones', description: 'Mobile phones and accessories' },
  { name: 'Tablets', description: 'Tablets and e-readers' },
  { name: 'Accessories', description: 'Peripherals, cables, and add-ons' },
];

async function seed() {
  const orm = await MikroORM.init<MongoDriver>({
    driver: MongoDriver,
    clientUrl: process.env.DATABASE_URL ?? 'mongodb://localhost:27017',
    dbName: process.env.DATABASE_NAME ?? 'co3115-hcmut',
    entities: [
      User, Admin, Customer, Category, Product, ProductItem,
      ShoppingCart, CartItem, Order, OrderDetail,
    ],
    allowGlobalContext: true,
  });

  const em = orm.em.fork();

  console.log('🌱 Starting seed...\n');

  // --- Seed Admin ---
  let adminUser = await em.findOne(User, { email: ADMIN.email });
  if (!adminUser) {
    const hashed = await hashPassword(ADMIN.password);
    adminUser = new User(ADMIN.email, hashed, UserRole.ADMIN);
    em.persist(adminUser);

    const admin = new Admin(adminUser, AdminRole.SUPER_ADMIN);
    em.persist(admin);

    await em.flush();
    console.log(`✅ Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  } else {
    console.log(`⏭  Admin already exists, skipping.`);
  }

  // --- Seed Categories ---
  for (const cat of CATEGORIES) {
    const existing = await em.findOne(Category, { categoryName: cat.name });
    if (!existing) {
      const category = new Category(cat.name, cat.description);
      em.persist(category);
      console.log(`✅ Category created: ${cat.name}`);
    } else {
      console.log(`⏭  Category "${cat.name}" already exists, skipping.`);
    }
  }

  await em.flush();

  console.log('\n🎉 Seed completed.');
  await orm.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
