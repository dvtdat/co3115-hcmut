import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { config } from 'dotenv';
import { User, UserRole } from '../entities/user/user.entity';
import { hashPassword } from '../common/utils/password.util';

config();

const ADMIN = {
  email: 'admin@co3115.hcmut.edu.vn',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'CO3115',
};

async function seed() {
  const orm = await MikroORM.init<MongoDriver>({
    driver: MongoDriver,
    clientUrl: process.env.DATABASE_URL ?? 'mongodb://localhost:27017',
    dbName: process.env.DATABASE_NAME ?? 'co3115-hcmut',
    entities: [User],
    allowGlobalContext: true,
  });

  const em = orm.em.fork();

  console.log('🌱 Starting seed...\n');

  let admin = await em.findOne(User, { email: ADMIN.email });
  if (!admin) {
    const hashed = await hashPassword(ADMIN.password);
    admin = new User(
      ADMIN.email,
      ADMIN.firstName,
      ADMIN.lastName,
      hashed,
      UserRole.ADMIN,
    );
    em.persist(admin);
    await em.flush();
    console.log(`✅ Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  } else {
    console.log(`⏭  Admin already exists, skipping.`);
  }

  console.log('\n🎉 Seed completed.');
  await orm.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
