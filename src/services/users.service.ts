import bcrypt from 'bcryptjs';
import { Role } from '../types';
import prisma from '../prismaClient';
import { AppError } from '../errors/AppError';
import { UpdateMeInput, AdminUpdateUserInput } from '../schemas/user.schema';

const SALT_ROUNDS = 12;

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getMe(userId: number) {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function updateMe(userId: number, data: UpdateMeInput) {
  if (data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: data.email, id: { not: userId } },
    });
    if (conflict) throw new AppError(409, 'Email is already in use');
  }

  const updateData: Record<string, unknown> = {};
  if (data.email) updateData.email = data.email;
  if (data.password) updateData.hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: PUBLIC_USER_SELECT,
  });
}

export async function listUsers(page: number, pageSize: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { isDeleted: false },
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where: { isDeleted: false } }),
  ]);

  return {
    items: users,
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize),
  };
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function adminUpdateUser(
  targetId: number,
  requesterId: number,
  data: AdminUpdateUserInput,
) {
  if (targetId === requesterId && data.role && data.role !== Role.ADMIN) {
    throw new AppError(400, 'Admins cannot demote themselves');
  }

  const user = await prisma.user.findFirst({
    where: { id: targetId, isDeleted: false },
  });
  if (!user) throw new AppError(404, 'User not found');

  return prisma.user.update({
    where: { id: targetId },
    data,
    select: PUBLIC_USER_SELECT,
  });
}

export async function softDeleteUser(targetId: number, requesterId: number) {
  if (targetId === requesterId) {
    throw new AppError(400, 'Cannot delete your own account');
  }

  const user = await prisma.user.findFirst({
    where: { id: targetId, isDeleted: false },
  });
  if (!user) throw new AppError(404, 'User not found');

  await prisma.user.update({
    where: { id: targetId },
    data: { isDeleted: true, isActive: false },
  });
}
