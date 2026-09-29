# BeautyIQ Architecture & Project Structure Guide

Welcome to the BeautyIQ project structure! This document details the architectural layout, directory organization, and expansion patterns across the **Frontend**, **Backend**, and **Database** layers.

---

## 🏗️ High-Level Directory Overview

```
beautyiq/
├── src/
│   ├── frontend/             # 🎨 ALL FRONTEND CODE (UI components, layouts, context state)
│   │   ├── components/       # Reusable UI & Domain components
│   │   ├── context/          # React State Providers (auth, theme, toast, skin-profile, etc.)
│   │   └── index.ts          # Unified frontend barrel export
│   │
│   ├── backend/              # ⚙️ ALL BACKEND LOGIC (services, business logic, security)
│   │   ├── services/         # Business services (auth, products, recommendations, pipeline)
│   │   ├── security/         # Security guards, AI guardrails, rate limiting, validators
│   │   └── index.ts          # Unified backend barrel export
│   │
│   ├── database/             # 🗄️ ALL DATABASE CODE (SQLite client, schema, repositories, seeds)
│   │   ├── connection.ts     # Better-SQLite3 singleton with WAL mode & busy timeout
│   │   ├── schema.ts         # SQL DDL table migrations (users, profiles, sessions, etc.)
│   │   ├── repositories.ts   # DbService query methods & transactions
│   │   ├── crypto.ts         # Secure scrypt password hashing & verification
│   │   ├── seeds.ts          # Seed catalog data (brands, products, ingredients)
│   │   └── index.ts          # Unified database barrel export
│   │
│   ├── app/                  # 🌐 NEXT.JS APP ROUTER (Pages, Layouts & HTTP Route Handlers)
│   │   ├── (auth)/           # Authentication pages (login, register, forgot-password)
│   │   ├── (customer)/       # Customer dashboard & settings pages
│   │   ├── (public)/         # Public marketplace pages (browse, search, compare)
│   │   ├── admin/            # Admin management portal pages
│   │   ├── api/              # HTTP REST API route handlers (/api/admin, /api/wishlist, etc.)
│   │   ├── globals.css       # Tailwind CSS & theme definitions
│   │   ├── layout.tsx        # Root HTML layout & global providers
│   │   └── page.tsx          # Homepage
│   │
│   ├── types/                # 📐 Domain TypeScript definitions and data interfaces
│   │   └── index.ts
│   │
│   ├── shared/               # 🔄 Shared cross-layer exports (types & utilities)
│   │   └── index.ts
│   │
│   ├── lib/                  # 🛡️ Utilities & backward-compatibility re-exports
│   │   ├── utils.ts          # Styling and general helper functions
│   │   ├── db.ts             # Facade re-exporting from @/database
│   │   └── mock-data.ts      # Facade re-exporting from @/database/seeds
│   │
│   └── middleware.ts         # Next.js edge route guard middleware
│
├── data/                     # 💾 SQLite database storage (beautyiq.db)
└── package.json              # Project dependencies and npm scripts
```

---

## 🎨 1. Frontend Layer (`src/frontend/`)

Everything related to visual presentation and client-side state is stored here.

### Organization:
- **`src/frontend/components/ui/`**: Atomic design system primitives:
  - `button.tsx`, `input.tsx`, `modal.tsx`, `badge.tsx`, `toast.tsx`, `table.tsx`, `tabs.tsx`, etc.
- **`src/frontend/components/layout/`**: Structural layout components:
  - `navbar.tsx`, `footer.tsx`, `container.tsx`, `customer-sidebar.tsx`, `admin-sidebar.tsx`, etc.
- **`src/frontend/components/home/`**: Homepage-specific sections:
  - `hero.tsx`, `featured-products.tsx`, `ai-search.tsx`, `price-comparison.tsx`, etc.
- **`src/frontend/components/product/`**: Product browsing & comparison cards:
  - `product-card.tsx`, `grouped-search-input.tsx`
- **`src/frontend/components/admin/`**: Admin portal components:
  - `admin-table.tsx`, `admin-stat-card.tsx`, `admin-confirm-modal.tsx`
- **`src/frontend/context/`**: React Context state management:
  - `auth-context.tsx`: User login session, role checking, permissions.
  - `theme-context.tsx`: Light/Dark mode state and toggle.
  - `toast-context.tsx`: Global notification toast system.
  - `skin-profile-context.tsx`: User personalized skin profile & quiz data.
  - `comparison-context.tsx`: Multi-product ingredient comparison tray.

### How to Expand:
- To add a new UI element: Create a component under `src/frontend/components/ui/` or the relevant domain folder.
- To add a new state provider: Create a new context inside `src/frontend/context/` and export it in `src/frontend/index.ts`.
- Path aliases:
  ```ts
  import { Button } from "@/frontend/components/ui/button";
  import { useAuth } from "@/frontend/context/auth-context";
  // or via barrel:
  import { Button, useAuth } from "@/frontend";
  ```

---

## ⚙️ 2. Backend Layer (`src/backend/`)

Contains business rules, server-side data processors, algorithms, and security guards.

### Organization:
- **`src/backend/services/`**: Core domain logic:
  - `auth.service.ts`: Session tokens, cookie parsing, login, and registration.
  - `product.service.ts`: Product retrieval, filtering, and catalog management.
  - `recommendation-engine.service.ts`: AI & heuristic ingredient compatibility matching.
  - `comparison.service.ts`: Side-by-side product price & ingredient comparison.
  - `admin-data.service.ts`: Platform administration metrics, seller data, listings.
  - `data-pipeline/`: 7-stage automated data ingestion and quality calculator pipeline.
- **`src/backend/security/`**: Policy enforcement & protection:
  - `auth-guard.ts`: Role-based route protection (`admin`, `customer`).
  - `ai-guardrail.service.ts`: Prompt injection and hallucination safety filters.
  - `medical-safety.ts`: Disclaimers and dermatological restriction checks.
  - `rate-limiter.ts`: Sliding-window request throttling.
  - `input-validator.ts`: XSS, SQLi, and payload sanitization.

### How to Expand:
- To add a new business workflow: Create a service file under `src/backend/services/` (e.g. `order.service.ts`).
- To add a security rule: Create a validator under `src/backend/security/`.
- Path aliases:
  ```ts
  import { ProductService } from "@/backend/services/product.service";
  import { AuthGuard } from "@/backend/security/auth-guard";
  // or via barrel:
  import { ProductService, AuthGuard } from "@/backend";
  ```

---

## 🗄️ 3. Database Layer (`src/database/`)

Encapsulates data persistence, schema migrations, and database access.

### Organization:
- **`connection.ts`**: Better-SQLite3 singleton connection. Configured with:
  - `WAL` (Write-Ahead Logging) mode for high concurrency.
  - `busy_timeout = 5000` to prevent `SQLITE_BUSY` file locks under load.
  - Foreign key constraint enforcement (`foreign_keys = ON`).
- **`schema.ts`**: Auto-migrated table DDL schemas:
  - `users`: User identity and role management.
  - `user_profiles`: JSON-stored skin concerns, preferences, and privacy.
  - `sessions`: Persistent auth session tokens.
  - `wishlists`: Saved user bookmarks.
  - `saved_products`: Products marked for comparison or future purchase.
  - `recommendation_history`: Log of personalized recommendation sessions.
- **`repositories.ts`**: `DbService` data access layer exposing typed methods for all tables.
- **`crypto.ts`**: Scrypt-based password hashing with cryptographic salt and timing-safe equality checks.
- **`seeds.ts`**: Default catalog dataset (mock products, brands, platforms, ingredients).

### How to Expand:
- To add a new table: Add a `CREATE TABLE IF NOT EXISTS` statement in `src/database/schema.ts`.
- To add query methods: Add static methods to `DbService` inside `src/database/repositories.ts`.
- To seed new records: Add them to `src/database/seeds.ts`.
- Path aliases:
  ```ts
  import { db, DbService } from "@/database";
  ```

---

## 🌐 4. Routing & API (`src/app/`)

Next.js App Router connects incoming HTTP requests to Frontend components and Backend services.

### Organization:
- **`src/app/api/`**: Server-side API endpoints (`GET`, `POST`, `PUT`, `DELETE`).
  - Calls `src/backend/services` and `src/database` to process requests.
- **`src/app/(public)/`**: Public UI pages (landing, browse, product details, ingredients, compare).
- **`src/app/(customer)/`**: Customer UI pages (account dashboard, profile, history, wishlist).
- **`src/app/(auth)/`**: Login, registration, and password recovery pages.
- **`src/app/admin/`**: Admin portal pages (dashboard, products, brands, platforms, logs).

---

## 🛠️ TypeScript Path Aliases

The project is configured in `tsconfig.json` with direct shortcuts for every domain:

| Alias | Target Directory | Description |
|---|---|---|
| `@/frontend` | `src/frontend/index.ts` | Frontend barrel exports |
| `@/frontend/*` | `src/frontend/*` | Components, Context, Layouts |
| `@/backend` | `src/backend/index.ts` | Backend barrel exports |
| `@/backend/*` | `src/backend/*` | Services, Security, Pipeline |
| `@/database` | `src/database/index.ts` | Database singleton, schema, repo |
| `@/database/*` | `src/database/*` | Direct database modules |
| `@/shared` | `src/shared/index.ts` | Common types & utilities |
| `@/types` | `src/types/index.ts` | TypeScript interfaces & types |
| `@/*` | `src/*` | General project root fallback |

*All legacy paths (`@/components/*`, `@/services/*`, `@/lib/db`, `@/lib/mock-data`) remain 100% supported through compatibility facades.*

---

## 🚀 Running the Project Locally

```bash
# 1. Start the development server
npm run dev

# 2. Build for production
npm run build

# 3. Start the production server
npm run start
```
