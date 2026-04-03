import request from 'supertest';
import { Role } from '../src/types';
import { Decimal } from '@prisma/client/runtime/library';
import app from '../src/app';
import { setupTestDb, clearTestDb, teardownTestDb, testPrisma } from './setup';
import { createUserAndGetToken } from './helpers';

beforeAll(async () => {
  await setupTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await teardownTestDb();
});

async function seedTransactions(ownerId: number) {
  await testPrisma.transaction.createMany({
    data: [
      { ownerId, amount: new Decimal('1000.00'), type: 'INCOME', category: 'salary', date: new Date('2026-03-01') },
      { ownerId, amount: new Decimal('500.00'), type: 'INCOME', category: 'freelance', date: new Date('2026-03-15') },
      { ownerId, amount: new Decimal('200.00'), type: 'EXPENSE', category: 'food', date: new Date('2026-03-10') },
      { ownerId, amount: new Decimal('150.00'), type: 'EXPENSE', category: 'transport', date: new Date('2026-03-20') },
    ],
  });
}

describe('GET /dashboard/summary', () => {
  it('VIEWER cannot access summary (403)', async () => {
    const { token } = await createUserAndGetToken('viewer_dash', Role.VIEWER);
    const res = await request(app).get('/dashboard/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('ANALYST gets correct summary totals', async () => {
    const { token, userId } = await createUserAndGetToken('analyst_dash', Role.ANALYST);
    await seedTransactions(userId);

    const res = await request(app).get('/dashboard/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe('1500.00');
    expect(res.body.totalExpenses).toBe('350.00');
    expect(res.body.netBalance).toBe('1150.00');
    expect(res.body.transactionCount).toBe(4);
  });

  it('ADMIN gets summary', async () => {
    const { token, userId } = await createUserAndGetToken('admin_dash', Role.ADMIN);
    await seedTransactions(userId);

    const res = await request(app).get('/dashboard/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(parseFloat(res.body.totalIncome)).toBeGreaterThan(0);
  });

  it('date filter narrows results', async () => {
    const { token, userId } = await createUserAndGetToken('analyst_dash2', Role.ANALYST);
    await seedTransactions(userId);

    const res = await request(app)
      .get('/dashboard/summary?dateFrom=2026-03-01&dateTo=2026-03-10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Only transactions from March 1-10: 1000 income + 200 expense
    expect(res.body.totalIncome).toBe('1000.00');
    expect(res.body.totalExpenses).toBe('200.00');
  });
});

describe('GET /dashboard/categories', () => {
  it('returns category breakdown', async () => {
    const { token, userId } = await createUserAndGetToken('analyst_cat', Role.ANALYST);
    await seedTransactions(userId);

    const res = await request(app)
      .get('/dashboard/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.categories).toBeDefined();
    expect(Array.isArray(res.body.categories)).toBe(true);

    const categories = res.body.categories as Array<{
      category: string;
      type: string;
      total: string;
      count: number;
      percentage: number;
    }>;

    const salaryCategory = categories.find(
      (c) => c.category === 'salary' && c.type === 'INCOME',
    );
    expect(salaryCategory).toBeDefined();
    expect(salaryCategory!.total).toBe('1000.00');
    expect(salaryCategory!.count).toBe(1);
  });
});

describe('GET /dashboard/trends/monthly', () => {
  it('returns monthly trend data', async () => {
    const { token, userId } = await createUserAndGetToken('analyst_trend', Role.ANALYST);
    await seedTransactions(userId);

    const res = await request(app)
      .get('/dashboard/trends/monthly?periods=3')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.trends).toBeDefined();
    expect(Array.isArray(res.body.trends)).toBe(true);
  });
});

describe('GET /dashboard/recent', () => {
  it('returns recent transactions', async () => {
    const { token, userId } = await createUserAndGetToken('analyst_recent', Role.ANALYST);
    await seedTransactions(userId);

    const res = await request(app)
      .get('/dashboard/recent?limit=3')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(3);
  });
});
