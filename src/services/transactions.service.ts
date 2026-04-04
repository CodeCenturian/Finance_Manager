import { Role } from '../types';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../prismaClient';
import { AppError } from '../errors/AppError';
import {
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionFilterInput,
} from '../schemas/transaction.schema';

function serializeTransaction(t: {
  id: number;
  ownerId: number;
  amount: Decimal;
  type: string;
  category: string;
  date: Date;
  notes: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...t,
    amount: t.amount.toFixed(2),
  };
}

export async function createTransaction(data: TransactionCreateInput, ownerId: number) {
  const transaction = await prisma.transaction.create({
    data: {
      ownerId,
      amount: new Decimal(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes ?? null,
    },
  });
  return serializeTransaction(transaction);
}

export async function listTransactions(filters: TransactionFilterInput, userId: number, role: Role) {
  const where: any = {
    isDeleted: false,
    ...(role !== Role.ADMIN ? { ownerId: userId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.category ? { category: { contains: filters.category } } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          date: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const orderBy: any = {
    [filters.sortBy]: filters.sortOrder,
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    items: transactions.map(serializeTransaction),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pages: Math.ceil(total / filters.pageSize),
  };
}

export async function getTransactionById(id: number, userId: number, role: Role) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false,
      ...(role !== Role.ADMIN ? { ownerId: userId } : {}),
    },
  });
  if (!transaction) throw new AppError(404, 'Transaction not found');
  return serializeTransaction(transaction);
}

export async function updateTransaction(
  id: number,
  data: TransactionUpdateInput,
  userId: number,
  role: Role,
) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false,
      ...(role !== Role.ADMIN ? { ownerId: userId } : {}),
    },
  });
  if (!transaction) throw new AppError(404, 'Transaction not found');

  const updateData: any = {};
  if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const updated = await prisma.transaction.update({ where: { id }, data: updateData });
  return serializeTransaction(updated);
}

export async function softDeleteTransaction(id: number, userId: number, role: Role) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false,
      ...(role !== Role.ADMIN ? { ownerId: userId } : {}),
    },
  });
  if (!transaction) throw new AppError(404, 'Transaction not found');

  await prisma.transaction.update({ where: { id }, data: { isDeleted: true } });
}
