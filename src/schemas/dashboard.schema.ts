import { z } from 'zod';

export const DashboardFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const TrendQuerySchema = z.object({
  periods: z.coerce.number().int().min(1).max(24).default(12),
});

export const RecentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type DashboardFilterInput = z.infer<typeof DashboardFilterSchema>;
