import request from 'supertest';
import { Role } from '../src/types';
import app from '../src/app';
import { testPrisma } from './setup';
import bcrypt from 'bcryptjs';

export async function createUserAndGetToken(
  username: string,
  role: Role,
): Promise<{ token: string; userId: number }> {
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await testPrisma.user.create({
    data: {
      email: `${username}@test.com`,
      username,
      hashedPassword,
      role,
    },
  });

  const loginRes = await request(app).post('/auth/login').send({ username, password });
  return { token: loginRes.body.accessToken as string, userId: user.id };
}
