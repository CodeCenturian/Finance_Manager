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

describe('GET /users/me', () => {
  it('returns own profile', async () => {
    const { token } = await createUserAndGetToken('meuser', Role.VIEWER);

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('meuser');
    expect(res.body).not.toHaveProperty('hashedPassword');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /users (Admin only)', () => {
  it('ADMIN can list all users', async () => {
    const { token } = await createUserAndGetToken('admin_list', Role.ADMIN);
    await createUserAndGetToken('user1', Role.VIEWER);
    await createUserAndGetToken('user2', Role.ANALYST);

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(3);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
  });

  it('VIEWER cannot list users (403)', async () => {
    const { token } = await createUserAndGetToken('viewer_list', Role.VIEWER);

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('ANALYST cannot list users (403)', async () => {
    const { token } = await createUserAndGetToken('analyst_list', Role.ANALYST);

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /users/:id (Admin only)', () => {
  it('ADMIN can change user role', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin_upd', Role.ADMIN);
    const { userId: viewerId } = await createUserAndGetToken('viewer_upd', Role.VIEWER);

    const res = await request(app)
      .put(`/users/${viewerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ANALYST' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ANALYST');
  });

  it('ADMIN can deactivate a user', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin_deact', Role.ADMIN);
    const { userId: targetId } = await createUserAndGetToken('target_user', Role.VIEWER);

    const res = await request(app)
      .put(`/users/${targetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  it('inactive user cannot login', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin_inact', Role.ADMIN);
    const { userId: targetId } = await createUserAndGetToken('inactive_user', Role.VIEWER);

    // Deactivate
    await request(app)
      .put(`/users/${targetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    // Attempt login
    const loginRes = await request(app).post('/auth/login').send({
      username: 'inactive_user',
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(403);
  });
});

describe('DELETE /users/:id (Admin only)', () => {
  it('ADMIN can soft-delete a user', async () => {
    const { token: adminToken } = await createUserAndGetToken('admin_del', Role.ADMIN);
    const { userId: targetId } = await createUserAndGetToken('del_user', Role.VIEWER);

    const res = await request(app)
      .delete(`/users/${targetId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    // Deleted user should not appear in list
    const listRes = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    const found = listRes.body.items.find((u: { id: number }) => u.id === targetId);
    expect(found).toBeUndefined();
  });

  it('ADMIN cannot delete own account', async () => {
    const { token: adminToken, userId: adminId } = await createUserAndGetToken('admin_self', Role.ADMIN);

    const res = await request(app)
      .delete(`/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
