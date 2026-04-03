import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account. Role defaults to VIEWER unless an authenticated admin specifies otherwise.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Secure123!
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *                 description: Only honoured when called by an authenticated ADMIN
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       409:
 *         description: Email or username already taken
 *       422:
 *         description: Validation error
 */
router.post('/register', validateBody(RegisterSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and obtain a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: Secure123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is inactive
 */
router.post('/login', validateBody(LoginSchema), authController.login);

export default router;
