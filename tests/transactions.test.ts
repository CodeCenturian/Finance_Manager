import request from 'supertest';
import { Role } from '../src/types';
import app from '../src/app';
import { setupTestDb, clearTestDb, teardownTestDb } from './setup';
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

const sampleTx = {
  amount: 100.5,
  type: 'INCOME',
  category: 'salary',
  date: '2026-03-01',
  notes: 'March salary',
};

describe('POST /transactions', () => {
  it('ANALYST can create a transaction', async () => {
    const { token } = await createUserAndGetToken('analyst1', Role.ANALYST);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTx);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      amount: '100.50',
      type: 'INCOME',
      category: 'salary',
    });
  });

  it('ADMIN can create a transaction', async () => {
    const { token } = await createUserAndGetToken('admin1', Role.ADMIN);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTx);

    expect(res.status).toBe(201);
  });

  it('VIEWER cannot create a transaction (403)', async () => {
    const { token } = await createUserAndGetToken('viewer1', Role.VIEWER);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTx);

    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/transactions').send(sampleTx);
    expect(res.status).toBe(401);
  });

  it('returns 422 for negative amount', async () => {
    const { token } = await createUserAndGetToken('analyst2', Role.ANALYST);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTx, amount: -50 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing required fields', async () => {
    const { token } = await createUserAndGetToken('analyst3', Role.ANALYST);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 100 }); // missing type, category, date

    expect(res.status).toBe(422);
  });
});

describe('GET /transactions', () => {
  it('VIEWER can list their own transactions', async () => {
    const { token, userId } = await createUserAndGetToken('viewer2', Role.VIEWER);
    const { token: analystToken } = await createUserAndGetToken('analyst4', Role.ANALYST);

    // Create transaction as analyst
    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTx);

    // Viewer should get empty list (not their transactions)
    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('ADMIN sees all transactions', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin2', Role.ADMIN);
    const { token: analystToken } = await createUserAndGetToken('analyst5', Role.ANALYST);

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTx);

    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
  });

  it('filters by type', async () => {
    const { token } = await createUserAndGetToken('analyst6', Role.ANALYST);

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTx, type: 'INCOME' });

    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTx, type: 'EXPENSE' });

    const res = await request(app)
      .get('/transactions?type=INCOME')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.every((t: { type: string }) => t.type === 'INCOME')).toBe(true);
  });

  it('paginates correctly', async () => {
    const { token } = await createUserAndGetToken('analyst7', Role.ANALYST);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(sampleTx);
    }

    const res = await request(app)
      .get('/transactions?page=1&pageSize=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(5);
    expect(res.body.pages).toBe(3);
  });
});

describe('DELETE /transactions/:id', () => {
  it('ADMIN can soft-delete a transaction', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin3', Role.ADMIN);
    const { token: analystToken } = await createUserAndGetToken('analyst8', Role.ANALYST);

    const createRes = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTx);

    const txId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(204);

    // Should no longer appear in list
    const listRes = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.body.items.find((t: { id: number }) => t.id === txId)).toBeUndefined();
  });

  it('ANALYST cannot delete a transaction (403)', async () => {
    const { token: analystToken } = await createUserAndGetToken('analyst9', Role.ANALYST);

    const createRes = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(sampleTx);

    const txId = createRes.body.id;

    const res = await request(app)
      .delete(`/transactions/${txId}`)
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(403);
  });
});
