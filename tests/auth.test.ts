import request from 'supertest';
import app from '../src/app';
import { setupTestDb, clearTestDb, teardownTestDb } from './setup';

beforeAll(async () => {
  await setupTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await teardownTestDb();
});

describe('POST /auth/register', () => {
  it('creates a user and returns 201', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'alice@example.com',
      username: 'alice',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: 'alice@example.com',
      username: 'alice',
      role: 'VIEWER',
      isActive: true,
    });
    expect(res.body).not.toHaveProperty('hashedPassword');
  });

  it('defaults role to VIEWER', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'bob@example.com',
      username: 'bob',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('VIEWER');
  });

  it('returns 409 on duplicate email', async () => {
    await request(app).post('/auth/register').send({
      email: 'dup@example.com',
      username: 'user1',
      password: 'Password123!',
    });

    const res = await request(app).post('/auth/register').send({
      email: 'dup@example.com',
      username: 'user2',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 409 on duplicate username', async () => {
    await request(app).post('/auth/register').send({
      email: 'user1@example.com',
      username: 'dupuser',
      password: 'Password123!',
    });

    const res = await request(app).post('/auth/register').send({
      email: 'user2@example.com',
      username: 'dupuser',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });

  it('returns 422 for short password', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'short',
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 422 for invalid email', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'not-an-email',
      username: 'testuser',
      password: 'Password123!',
    });

    expect(res.status).toBe(422);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send({
      email: 'login@example.com',
      username: 'loginuser',
      password: 'Password123!',
    });
  });

  it('returns token on valid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'loginuser',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      tokenType: 'Bearer',
    });
    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'loginuser',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'ghost',
      password: 'Password123!',
    });

    expect(res.status).toBe(401);
  });
});
