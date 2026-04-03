# Finance Data Processing & Access Control Backend

A production-ready REST API built with **Node.js**, **TypeScript**, **Express**, **Prisma ORM**, and **SQLite**. It handles user authentication, role-based access control, financial transaction management, and analytics dashboards.

This backend powers a **finance management system** with three types of users:

| Role | What They Can Do |
|------|-----------------|
| **VIEWER** | Register, log in, view their own transactions |
| **ANALYST** | Everything VIEWER can do, plus create/edit transactions and view dashboard analytics |
| **ADMIN** | Full access — manage all users, all transactions, all dashboard data |

Key features:
- JWT-based login/registration
- CRUD for financial transactions (income, expenses)
- Dashboard analytics (summaries, category breakdowns, monthly/weekly trends)
- Full filtering, sorting, and pagination on transaction lists
- Soft deletes (records are never truly deleted, just hidden)
- Swagger UI at `/api-docs` for interactive API testing

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **TypeScript** | Type safety on top of JavaScript |
| **Express** | Web framework — handles HTTP routes |
| **Prisma** | ORM — talks to the database using TypeScript objects |
| **SQLite** | Database — a single file (`finance.db`) on disk |
| **Zod** | Input validation — ensures data has the right shape |
| **JWT (jsonwebtoken)** | Authentication — stateless login tokens |
| **bcryptjs** | Password hashing |
| **Decimal.js** | Precise arithmetic (avoids floating-point bugs with money) |
| **swagger-jsdoc + swagger-ui-express** | Auto-generates interactive API docs |
| **Jest + Supertest** | Automated testing |

---

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
DATABASE_URL="file:./finance.db"        # SQLite (dev) or PostgreSQL (production)
JWT_SECRET="your-strong-secret-key"     # Min 32 chars, change for production
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

**Production Example (PostgreSQL):**
```env
DATABASE_URL="postgresql://user:password@host:5432/finance_db"
JWT_SECRET="generate-with-node-crypto"
NODE_ENV=production
```

⚠️ **Security:** Never commit `.env` to GitHub (protected by `.gitignore`).

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- auth.test.ts
npm test -- transactions.test.ts
```

### Coverage Report
```bash
npm run test:coverage
```

__Test Files:__
- `tests/auth.test.ts` — Registration, login, JWT
- `tests/users.test.ts` — User CRUD, role-based access
- `tests/transactions.test.ts` — Transaction CRUD, filters, pagination
- `tests/dashboard.test.ts` — Analytics endpoints

---

## Security

| Feature | Implementation |
|---------|-----------------|
| **Password Hashing** | bcryptjs (salt rounds: 10) |
| **Authentication** | JWT stateless tokens |
| **Authorization** | Role-based (VIEWER, ANALYST, ADMIN) |
| **Input Validation** | Zod schemas on all endpoints |
| **Soft Deletes** | Records marked `isDeleted`, not removed |
| **Error Handling** | Generic messages (no sensitive details) |
| **HTTPS** | Required in production |
| **CORS** | Configurable in `src/app.ts` |

**Best Practices:**
- Use strong JWT_SECRET (min 32 characters)
- Set `NODE_ENV=production` on production servers
- Use HTTPS only (SSL/TLS certificates)
- Validate all user inputs (Zod handles this)
- Rotate JWT_SECRET periodically

---

## Local Setup

### Step 1: Clone the repository
```bash
git clone https://github.com/CodeCenturian/Finance_Manager
cd finance_backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Setup .env file
```bash
cp .env.example .env
```
Edit `.env` with your values.

### Step 4: Run migrations
```bash
npm run prisma:migrate
```

### Step 5: Start development server
```bash
npm run dev
```

Server runs at `http://localhost:3000`  
Swagger UI at `http://localhost:3000/api-docs`

---

## API Endpoints

### Authentication (Public)

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login & get JWT |

### Users (Requires login)

| Method | URL | Role | Description |
|--------|-----|------|-------------|
| `GET` | `/users/me` | Any | Get your profile |
| `PUT` | `/users/me` | Any | Update email/password |
| `GET` | `/users` | ADMIN | List all users |
| `GET` | `/users/:id` | ADMIN | Get user by ID |
| `PUT` | `/users/:id` | ADMIN | Update user role/status |
| `DELETE` | `/users/:id` | ADMIN | Soft-delete user |

### Transactions (Requires login)

| Method | URL | Role | Description |
|--------|-----|------|-------------|
| `POST` | `/transactions` | ANALYST, ADMIN | Create transaction |
| `GET` | `/transactions` | VIEWER+ | List with filters |
| `GET` | `/transactions/:id` | VIEWER+ | Get one transaction |
| `PUT` | `/transactions/:id` | ANALYST, ADMIN | Update transaction |
| `DELETE` | `/transactions/:id` | ADMIN | Soft-delete transaction |

**Filters for GET `/transactions`:**
```
?type=EXPENSE&category=food&dateFrom=2026-01-01&dateTo=2026-03-31&page=1&pageSize=20&sortBy=date&sortOrder=desc
```

### Dashboard (ANALYST, ADMIN only)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/dashboard/summary` | Total income, expenses, balance |
| `GET` | `/dashboard/categories` | Spending by category |
| `GET` | `/dashboard/trends/monthly` | Monthly income vs expense |
| `GET` | `/dashboard/trends/weekly` | Weekly income vs expense |
| `GET` | `/dashboard/recent` | Recent transactions |

---

## Quick Test

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","username":"alice","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'

# Create transaction (replace TOKEN)
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":150,"type":"EXPENSE","category":"food","date":"2026-03-15"}'
```

---

**Built by Ashutosh Kumar**
