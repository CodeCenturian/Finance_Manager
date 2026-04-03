import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import transactionsRoutes from './routes/transactions.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './errors/AppError';

const app = express();

app.use(express.json());

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
