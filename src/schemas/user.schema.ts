import { z } from 'zod';
import { Role } from '../types';

export const UpdateMeSchema = z
  .object({
    email: z.string().email('Invalid email format').optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const AdminUpdateUserSchema = z
  .object({
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;
