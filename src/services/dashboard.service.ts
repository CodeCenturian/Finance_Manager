import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../prismaClient';
import { DashboardFilterInput } from '../schemas/dashboard.schema';

function buildDateFilter(dateFrom?: Date, dateTo?: Date) {
  if (!dateFrom && !dateTo) return {};
  return {
    date: {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    },
  };
}


export async function getSummary(filters: DashboardFilterInput) {
  const dateFilter = buildDateFilter(filters.dateFrom, filters.dateTo);

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: 'INCOME', isDeleted: false, ...dateFilter },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { type: 'EXPENSE', isDeleted: false, ...dateFilter },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const totalIncome = incomeResult._sum.amount ?? new Decimal(0);
  const totalExpenses = expenseResult._sum.amount ?? new Decimal(0);
  const netBalance = new Decimal(totalIncome).minus(totalExpenses);

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netBalance: netBalance.toFixed(2),
    incomeCount: incomeResult._count.id,
    expenseCount: expenseResult._count.id,
    transactionCount: incomeResult._count.id + expenseResult._count.id,
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  };
}

export async function getCategoryBreakdown(filters: DashboardFilterInput) {
  const dateFilter = buildDateFilter(filters.dateFrom, filters.dateTo);

  const rows = await prisma.transaction.groupBy({
    by: ['category', 'type'],
    where: { isDeleted: false, ...dateFilter },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  // Compute grand total for percentage calculation
  const grandTotal = rows.reduce(
    (sum, row) => sum.plus(row._sum.amount ?? new Decimal(0)),
    new Decimal(0),
  );

  const categories = rows.map((row) => {
    const total = row._sum.amount ?? new Decimal(0);
    const percentage = grandTotal.isZero()
      ? 0
      : parseFloat(total.dividedBy(grandTotal).times(100).toFixed(2));

    return {
      category: row.category,
      type: row.type,
      total: total.toFixed(2),
      count: row._count.id,
      percentage,
    };
  });

  return { categories };
}

interface RawTrendRow {
  period: string;
  type: string;
  total: number;
}

export async function getMonthlyTrends(months: number) {
  const rows = await prisma.$queryRaw<RawTrendRow[]>`
    SELECT
      strftime('%Y-%m', date) AS period,
      type,
      SUM(CAST(amount AS REAL)) AS total
    FROM "Transaction"
    WHERE isDeleted = 0
      AND date >= date('now', ${`-${months - 1} months`}, 'start of month')
    GROUP BY period, type
    ORDER BY period ASC
  `;

  return pivotTrends(rows);
}

export async function getWeeklyTrends(weeks: number) {
  const rows = await prisma.$queryRaw<RawTrendRow[]>`
    SELECT
      strftime('%Y-%W', date) AS period,
      type,
      SUM(CAST(amount AS REAL)) AS total
    FROM "Transaction"
    WHERE isDeleted = 0
      AND date >= date('now', ${`-${weeks - 1} weeks`}, 'weekday 1', '-7 days')
    GROUP BY period, type
    ORDER BY period ASC
  `;

  return pivotTrends(rows);
}

function pivotTrends(rows: RawTrendRow[]) {
  const map = new Map<string, { period: string; income: string; expenses: string; net: string }>();

  for (const row of rows) {
    if (!map.has(row.period)) {
      map.set(row.period, { period: row.period, income: '0.00', expenses: '0.00', net: '0.00' });
    }
    const entry = map.get(row.period)!;
    const amount = new Decimal(row.total ?? 0);

    if (row.type === 'INCOME') {
      entry.income = amount.toFixed(2);
    } else {
      entry.expenses = amount.toFixed(2);
    }

    entry.net = new Decimal(entry.income).minus(new Decimal(entry.expenses)).toFixed(2);
  }

  return { trends: Array.from(map.values()) };
}

export async function getRecentTransactions(limit: number) {
  const transactions = await prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      owner: {
        select: { id: true, username: true },
      },
    },
  });

  return {
    transactions: transactions.map((t) => ({
      ...t,
      amount: t.amount.toFixed(2),
    })),
  };
}
