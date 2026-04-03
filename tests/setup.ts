import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

// Use a separate test database
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.JWT_EXPIRES_IN = '1h';

export const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});

export async function setupTestDb() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'pipe',
  });
}

export async function clearTestDb() {
  await testPrisma.transaction.deleteMany();
  await testPrisma.user.deleteMany();
}

export async function teardownTestDb() {
  await testPrisma.$disconnect();
}
