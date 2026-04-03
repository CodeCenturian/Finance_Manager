import { z } from 'zod';
import { TransactionType } from '../types';

export const TransactionCreateSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1, 'Category is required').max(100),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const TransactionUpdateSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive('Amount must be greater than 0')
      .multipleOf(0.01)
      .optional(),
    type: z.nativeEnum(TransactionType).optional(),
    category: z.string().min(1).max(100).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const TransactionFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;
export type TransactionFilterInput = z.infer<typeof TransactionFilterSchema>;
