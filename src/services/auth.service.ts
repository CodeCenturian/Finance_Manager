import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '../types';
import { config } from '../config';
import prisma from '../prismaClient';
import { AppError } from '../errors/AppError';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const SALT_ROUNDS = 12;

export async function registerUser(data: RegisterInput, requestingRole?: Role) {
  // Only admins may assign non-VIEWER roles at registration
  const assignedRole =
    requestingRole === Role.ADMIN && data.role ? data.role : Role.VIEWER;

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email } }),
    prisma.user.findUnique({ where: { username: data.username } }),
  ]);

  if (existingEmail) throw new AppError(409, 'Email is already registered');
  if (existingUsername) throw new AppError(409, 'Username is already taken');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      hashedPassword,
      role: assignedRole,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (!user || user.isDeleted) {
    throw new AppError(401, 'Invalid username or password');
  }

  const passwordMatch = await bcrypt.compare(data.password, user.hashedPassword);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid username or password');
  }

  if (!user.isActive) {
    throw new AppError(403, 'Account is inactive. Please contact an administrator.');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
  );

  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
}
