import { Router } from 'express';
import { Role } from '../types';
import { authenticate } from '../middleware/authenticate';
import { requireRoles } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { TransactionCreateSchema, TransactionUpdateSchema } from '../schemas/transaction.schema';
import * as txController from '../controllers/transactions.controller';

const router = Router();

/**
 * @openapi
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a transaction (Analyst or Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Analyst or Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  validateBody(TransactionCreateSchema),
  txController.createTransaction,
);

/**
 * @openapi
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions with filtering and pagination
 *     description: Viewers and Analysts see only their own records. Admins see all.
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: food
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, createdAt]
 *           default: date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated transaction list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTransactions'
 */
router.get(
  '/',
  authenticate,
  requireRoles(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  txController.listTransactions,
);

/**
 * @openapi
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a single transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.get(
  '/:id',
  authenticate,
  requireRoles(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  txController.getTransaction,
);

/**
 * @openapi
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction (Analyst or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionUpdate'
 *     responses:
 *       200:
 *         description: Updated transaction
 *       404:
 *         description: Transaction not found
 */
router.put(
  '/:id',
  authenticate,
  requireRoles(Role.ANALYST, Role.ADMIN),
  validateBody(TransactionUpdateSchema),
  txController.updateTransaction,
);

/**
 * @openapi
 * /transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Soft-delete a transaction (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Transaction deleted
 *       404:
 *         description: Transaction not found
 */
router.delete(
  '/:id',
  authenticate,
  requireRoles(Role.ADMIN),
  txController.deleteTransaction,
);

export default router;
