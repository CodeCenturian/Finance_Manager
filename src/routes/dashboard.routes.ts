import { Router } from 'express';
import { Role } from '../types';
import { authenticate } from '../middleware/authenticate';
import { requireRoles } from '../middleware/authorize';
import * as dashController from '../controllers/dashboard.controller';

const router = Router();

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get financial summary (total income, expenses, net balance)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-01-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-03-31"
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       403:
 *         description: Analyst or Admin role required
 */
router.get(
  '/summary',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  dashController.getSummary,
);

/**
 * @openapi
 * /dashboard/categories:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get category-wise breakdown of transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category breakdown with totals and percentages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryBreakdown'
 */
router.get(
  '/categories',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  dashController.getCategoryBreakdown,
);

/**
 * @openapi
 * /dashboard/trends/monthly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly income vs expense trends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 24
 *         description: Number of months to include
 *     responses:
 *       200:
 *         description: Monthly trend data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrendResponse'
 */
router.get(
  '/trends/monthly',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  dashController.getMonthlyTrends,
);

/**
 * @openapi
 * /dashboard/trends/weekly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get weekly income vs expense trends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 24
 *         description: Number of weeks to include
 *     responses:
 *       200:
 *         description: Weekly trend data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrendResponse'
 */
router.get(
  '/trends/weekly',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  dashController.getWeeklyTrends,
);

/**
 * @openapi
 * /dashboard/recent:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent transactions across all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Recent transactions
 */
router.get(
  '/recent',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  dashController.getRecentTransactions,
);

export default router;
