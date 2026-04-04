import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Data Processing API',
      version: '1.0.0',
      description:
        'A role-based access controlled backend for managing financial records, users, and dashboard analytics. Made by Ashutosh Kumar',
      contact: {
        name: 'Finance Backend -> Ashutosh Kumar',
      },
    },
    servers: [
      {
        url: 'https://finance-manager-n5ok.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            username: { type: 'string', example: 'johndoe' },
            role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGci...' },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '24h' },
            user: { $ref: '#/components/schemas/UserPublic' },
          },
        },
        TransactionCreate: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            amount: { type: 'number', example: 250.0, description: 'Must be > 0' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string', example: 'food' },
            date: { type: 'string', format: 'date', example: '2026-03-15' },
            notes: { type: 'string', example: 'Lunch with team', nullable: true },
          },
        },
        TransactionUpdate: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 300.0 },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string', example: 'transport' },
            date: { type: 'string', format: 'date' },
            notes: { type: 'string', nullable: true },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 42 },
            ownerId: { type: 'integer', example: 7 },
            amount: { type: 'string', example: '250.00', description: 'String to preserve decimal precision' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            category: { type: 'string', example: 'food' },
            date: { type: 'string', format: 'date-time' },
            notes: { type: 'string', nullable: true },
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedTransactions: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
            total: { type: 'integer', example: 145 },
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 20 },
            pages: { type: 'integer', example: 8 },
          },
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome: { type: 'string', example: '12500.00' },
            totalExpenses: { type: 'string', example: '8750.50' },
            netBalance: { type: 'string', example: '3749.50' },
            incomeCount: { type: 'integer', example: 45 },
            expenseCount: { type: 'integer', example: 72 },
            transactionCount: { type: 'integer', example: 117 },
          },
        },
        CategoryBreakdown: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string', example: 'food' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  total: { type: 'string', example: '1250.00' },
                  count: { type: 'integer', example: 23 },
                  percentage: { type: 'number', example: 14.3 },
                },
              },
            },
          },
        },
        TrendResponse: {
          type: 'object',
          properties: {
            trends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  period: { type: 'string', example: '2026-03' },
                  income: { type: 'string', example: '4500.00' },
                  expenses: { type: 'string', example: '3200.00' },
                  net: { type: 'string', example: '1300.00' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
