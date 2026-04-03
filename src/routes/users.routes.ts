import { Router } from 'express';
import { Role } from '../types';
import { authenticate } from '../middleware/authenticate';
import { requireRoles } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { UpdateMeSchema, AdminUpdateUserSchema } from '../schemas/user.schema';
import * as usersController from '../controllers/users.controller';

const router = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, usersController.getMe);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update own email or password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       409:
 *         description: Email already in use
 */
router.put('/me', authenticate, validateBody(UpdateMeSchema), usersController.updateMe);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Admin role required
 */
router.get('/', authenticate, requireRoles(Role.ADMIN), usersController.listUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin only)
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
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, requireRoles(Role.ADMIN), usersController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user role or active status (Admin only)
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
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user
 *       400:
 *         description: Cannot demote yourself
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  authenticate,
  requireRoles(Role.ADMIN),
  validateBody(AdminUpdateUserSchema),
  usersController.adminUpdateUser,
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Soft-delete a user (Admin only)
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
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, requireRoles(Role.ADMIN), usersController.deleteUser);

export default router;
