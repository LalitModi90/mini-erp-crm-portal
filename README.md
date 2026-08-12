# Mini ERP + CRM Operations Portal

A production-grade, full-stack **Mini ERP & CRM Operations Portal** for wholesale and distribution companies. It combines customer relationship management (CRM), product catalog management, inventory stock ledger, delivery challans, role-based access control (RBAC), audit logging, and an admin settings suite in a single dashboard.

---

## Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Installation & Setup](#-installation--setup)
7. [Environment Variables](#-environment-variables)
8. [Database](#-database)
9. [Cloudinary Image Uploads](#-cloudinary-image-uploads)
10. [Demo Accounts](#-demo-accounts)
11. [RBAC Access Matrix](#-rbac-access-matrix)
12. [API Endpoints](#-api-endpoints)
13. [Available Scripts](#-available-scripts)
14. [Docker Deployment](#-docker-deployment)
15. [Roadmap](#-roadmap)

---

## 🚀 Tech Stack

### Backend (`backend/`)
| Layer | Technology |
| --- | --- |
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | SQLite (local dev) / PostgreSQL (Supabase production) |
| Auth | Custom JWT (bearer token) + bcryptjs password hashing |
| Validation | Zod |
| Realtime/Cloud | Supabase Client SDK |

### Frontend (`frontend/`)
| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| UI | Bootstrap 5 + Lucide React icons |
| Charts | ApexCharts / React-ApexCharts |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Image Storage | Cloudinary (direct unsigned upload) |
| Backend as a Service | Supabase Client SDK |

---

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC)** — 4 roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` with route-level, menu-level, and action-level permissions enforced on both frontend and backend.
- **👥 Customer CRM** — Add / edit / delete customers, track customer type, GST, follow-up dates, and status.
- **📦 Product Catalog** — Manage products with SKU, category, pricing, stock, warehouse, and **Cloudinary image uploads**.
- **📊 Inventory Ledger** — Stock IN / OUT movements with full movement history (`StockMovement` table).
- **🧾 Delivery Challans** — Create draft challans, confirm with atomic transactional stock deduction, snapshot-based line items.
- **🛡️ Audit Logging** — Immutable, structured JSON audit records for critical business mutations.
- **📈 Role-Aware Dashboard** — KPIs, charts, and recent activity scoped to the logged-in role.
- **📄 Reports** — Role-scoped business reporting.
- **👤 User Management** — Admin-only user creation, editing, and deletion.
- **⚙️ Settings** — Company profile, logo (Cloudinary), email SMTP test, database backup & restore.
- **🔁 Resilient Frontend** — Automatic fallback to demo data when the backend is unreachable.

---

## 🏗 System Architecture

```
Client Browser (React SPA via Vite)
   │  HTTPS + JWT Bearer
   ▼
Express REST API  (http://localhost:5000)
   │
   ├── JWT Authentication Middleware
   ├── Role-Based Access Control Middleware
   │
   └── Prisma ORM
         ├── SQLite  (local dev: dev.db)
         └── PostgreSQL  (Supabase production)

Images are uploaded directly from the browser to Cloudinary (unsigned preset).
```

---

## 📁 Project Structure

```
mini-erp-crm-portal/
├── package.json                 # Root workspace (npm workspaces)
├── docker-compose.yml           # Backend + frontend containers
├── backend/
│   ├── .env                     # Backend environment variables
│   ├── src/
│   │   ├── app.ts               # Express app & route registration
│   │   ├── server.ts            # Server bootstrap
│   │   ├── config/              # database, env, supabase, seedData
│   │   ├── middleware/          # auth, role, error handlers
│   │   ├── modules/
│   │   │   ├── auth/            # register / login (JWT)
│   │   │   ├── users/           # user management (ADMIN only)
│   │   │   ├── customers/       # customer CRM
│   │   │   ├── products/        # product catalog
│   │   │   ├── inventory/       # stock ledger & adjustments
│   │   │   ├── challans/        # delivery challans
│   │   │   ├── dashboard/       # role-aware stats
│   │   │   └── audit/           # audit logs
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # SQLite schema
│   │   │   ├── schema.postgresql.prisma  # PostgreSQL schema
│   │   │   ├── supabase_schema.sql       # Supabase DDL
│   │   │   ├── supabase_seed.sql         # Supabase seed data
│   │   │   └── seed.js / seed.ts         # Local seed script
│   │   └── utils/               # jwt, response helpers
│   └── dist/                    # Compiled output
└── frontend/
    ├── .env                     # Frontend environment variables
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── config/              # roles.ts (RBAC), supabase.ts
        ├── context/             # AuthContext (JWT + user state)
        ├── components/          # ProtectedRoute, shared UI
        ├── layouts/             # DashboardLayout (sidebar + navbar)
        ├── routes/              # AppRoutes (role-guarded routing)
        ├── utils/               # auth, cloudinary helpers
        ├── services/            # API services
        └── pages/
            ├── auth/Login.tsx
            ├── dashboard/Dashboard.tsx
            ├── customers/Customers.tsx, AddCustomer.tsx
            ├── products/Products.tsx
            ├── inventory/Inventory.tsx
            ├── challans/Challans.tsx, CreateChallan.tsx
            ├── reports/Reports.tsx
            ├── Users.tsx
            ├── Settings.tsx
            └── Forbidden.tsx
```

---

## ⚙️ Prerequisites

- **Node.js** 18+ (with npm)
- **Git**
- (Optional) **Docker** + Docker Compose for containerized deployment
- Cloudinary account for image uploads
- Supabase project (optional — only needed for production PostgreSQL)

---

## 🔧 Installation & Setup

### 1. Clone & install dependencies

```bash
git clone <repository-url>
cd mini-erp-crm-portal
npm install
```

This uses **npm workspaces** and installs both `backend/` and `frontend/` dependencies.

### 2. Configure environment variables

Copy / create the environment files with your credentials (see [Environment Variables](#-environment-variables) below).

### 3. Prepare the database

```bash
# From the backend folder
cd backend

# Generate the Prisma client (required after schema changes)
npx prisma generate --schema=src/prisma/schema.prisma

# Sync the local SQLite database with the schema
npx prisma db push --schema=src/prisma/schema.prisma

# Seed demo data (users, customers, products, challans, movements)
npm run seed
```

### 4. Run backend

```bash
npm run dev --workspace=backend
# or: cd backend && npm run dev
# API runs at http://localhost:5000  (health check: http://localhost:5000/health)
```

### 5. Run frontend

```bash
npm run dev --workspace=frontend
# or: cd frontend && npm run dev
# App runs at http://localhost:5173
```

### 6. Login

Open `http://localhost:5173`, select a demo role, and sign in (see [Demo Accounts](#-demo-accounts)).

---

## 🔑 Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# Database (default SQLite for local)
DATABASE_URL="file:./dev.db"

# Supabase PostgreSQL connection (production)
SUPABASE_DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres"

# Supabase API credentials
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Auth
JWT_SECRET="your_strong_secret"
JWT_EXPIRES_IN="1d"

# Cloudinary credentials (also used by frontend uploads)
CLOUD_NAME="your_cloud_name"
API_KEY="your_api_key"
API_SECRET="your_api_secret"

# Email SMTP (for test email in Settings)
HOST="smtp.gmail.com"
PORT_MAIL=587
EMAIL_USER="you@gmail.com"
EMAIL_PASS="app_password"
```

### `frontend/.env`

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_ANON_KEY="eyJ..."

# Cloudinary direct upload (frontend)
VITE_CLOUDINARY_CLOUD_NAME="your_cloud_name"
VITE_CLOUDINARY_UPLOAD_PRESET="mini_erp_unsigned"
```

> ⚠️ **Never commit `.env` files.** They are already ignored via `.gitignore`.

---

## 🗄 Database

- **Local development:** SQLite via `backend/src/prisma/dev.db` (default `DATABASE_URL="file:./dev.db"`).
- **Production:** Supabase PostgreSQL — Prisma schema lives in `schema.postgresql.prisma`, with ready-to-run DDL (`supabase_schema.sql`) and seed (`supabase_seed.sql`).

### Key models

- `User` — id, name, email (unique), password (hashed), role
- `Customer` — CRM profile with type, GST, status, follow-up date
- `Product` — catalog item with SKU (unique), price, stock, warehouse, **imageUrl**
- `StockMovement` — immutable inventory ledger (IN / OUT)
- `Challan` / `ChallanItem` — delivery orders with snapshot line items
- `AuditLog` — structured JSON audit trail

> When switching to PostgreSQL, update `DATABASE_URL` in `backend/.env`, point Prisma to `schema.postgresql.prisma`, and run the migration SQL against your Supabase database.

---

## 🖼 Cloudinary Image Uploads

Product images and the company logo are uploaded **directly from the browser** to Cloudinary using an **unsigned upload preset** (no backend round-trip).

### Setup

1. Create a Cloudinary account and grab your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard.
2. In **Settings → Upload → Upload presets → Add upload preset**:
   - Name it `mini_erp_unsigned` (or your preferred name)
   - Set **Signing Mode** to **Unsigned**
   - Save
3. Put the values in your env files:
   - `frontend/.env`: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
   - `backend/.env`: `CLOUD_NAME`, `API_KEY`, `API_SECRET`

### Where uploads are used

- **Products page** → Add / Edit product modal: "Upload Image" button stores the returned `secure_url` in the product's `imageUrl`.
- **Settings page** → Company logo: uploaded to Cloudinary and the URL is persisted in `localStorage` (`mini_erp_company_logo`).

Uploads are routed to folders (`products/`, `logos/`) with a **5MB** size limit.

---

## 👤 Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@erp.com` | `password123` |
| SALES | `sales@erp.com` | `password123` |
| WAREHOUSE | `warehouse@erp.com` | `password123` |
| ACCOUNTS | `accounts@erp.com` | `password123` |

The login screen also provides one-click demo role buttons that pre-fill these credentials.

---

## 🔐 RBAC Access Matrix

### Page / Route access (frontend)

| Page | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| --- | :-: | :-: | :-: | :-: |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ❌ | ✅ |
| Add Customer | ✅ | ✅ | ❌ | ❌ |
| Products | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ |
| Challans | ✅ | ✅ | ✅ | ✅ |
| Create Challan | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ✅ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

### Backend API enforcement

| Module | Read | Create / Update | Delete |
| --- | --- | --- | --- |
| Customers | ADMIN, SALES, ACCOUNTS | ADMIN, SALES | ADMIN |
| Products | All authenticated | Create: ADMIN | ADMIN |
| Inventory | ADMIN, WAREHOUSE, ACCOUNTS | Adjust: ADMIN, WAREHOUSE | — |
| Challans | All authenticated | Create / Confirm: ADMIN, SALES | — |
| Users | ADMIN | ADMIN | ADMIN |
| Audit Logs | ADMIN | — | — |

> Access rules are defined in `frontend/src/config/roles.ts` (`ROUTE_ACCESS`, `MENU_ACCESS`, `ACTION_ACCESS`) and enforced in backend route guards via `authorizeRoles(...)`.

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns `{ user, token }` |

### Dashboard
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/dashboard/stats` | Role-aware dashboard statistics |

### Customers
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/customers` | ADMIN, SALES, ACCOUNTS |
| GET | `/api/customers/:id` | ADMIN, SALES, ACCOUNTS |
| POST | `/api/customers` | ADMIN, SALES |
| PUT | `/api/customers/:id` | ADMIN, SALES |
| DELETE | `/api/customers/:id` | ADMIN |

### Products
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/products` | All authenticated |
| GET | `/api/products/:id` | All authenticated |
| POST | `/api/products` | ADMIN |
| PUT | `/api/products/:id` | All authenticated |
| DELETE | `/api/products/:id` | ADMIN |

### Inventory & Stock
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/inventory` | ADMIN, WAREHOUSE, ACCOUNTS |
| GET | `/api/inventory/movements` | All authenticated |
| POST | `/api/inventory/stock` | ADMIN, WAREHOUSE |
| POST | `/api/products/:id/stock` | ADMIN, WAREHOUSE |
| GET | `/api/stock-movement` | ADMIN, WAREHOUSE, ACCOUNTS |

### Challans
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/challans` | All authenticated |
| GET | `/api/challans/:id` | All authenticated |
| POST | `/api/challans` | ADMIN, SALES |
| PATCH | `/api/challans/:id/confirm` | ADMIN, SALES |

### Users
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/users` | ADMIN |
| GET | `/api/users/:id` | ADMIN |
| POST | `/api/users` | ADMIN |
| PUT | `/api/users/:id` | ADMIN |
| DELETE | `/api/users/:id` | ADMIN |

### Audit Logs
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/audit-logs` | ADMIN |

### Health
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Service health check |

### Standard response envelope

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## 📜 Available Scripts

### Root workspace
| Command | Description |
| --- | --- |
| `npm run dev:backend` | Start backend dev server |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run build:backend` | Compile backend TypeScript |
| `npm run build:frontend` | Build frontend for production |

### Backend (`backend/`)
| Command | Description |
| --- | --- |
| `npm run dev` | Compile + run `dist/server.js` |
| `npm run build` | TypeScript compile to `dist/` |
| `npm run start` | Run compiled server |
| `npm run seed` | Seed the local SQLite database |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations |

### Frontend (`frontend/`)
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc`) + production build |
| `npm run preview` | Preview production build |

---

## 🐳 Docker Deployment

A `docker-compose.yml` is included:

```yaml
services:
  backend:   # builds ./backend, exposes port 5000
  frontend:  # builds ./frontend, exposes port 3000
```

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

Make sure all environment variables are available inside the containers (via `.env` files or Docker environment overrides).

---

## 🗺 Roadmap

- [ ] Add pagination/filtering server-side endpoints for all modules
- [ ] Email notifications for challan confirmation and low-stock alerts
- [ ] Soft-delete enforcement UI for products & customers
- [ ] CSV / Excel import-export for products and customers
- [ ] Dark mode theme
- [ ] Unit & integration test suites (Jest / Vitest)
- [ ] CI/CD pipeline (lint, typecheck, build, deploy)

---

© 2026 Mini ERP + CRM Operations Portal. All rights reserved.
