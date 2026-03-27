// File: scripts/clear-db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Clearing database...');
  await prisma.task.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleared completely!');
}

main()
  .catch((e) => {
    console.error('❌ Database clearing failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Закриваємо пул підключень, щоб скрипт успішно завершився
    await pool.end();
  });
