# BeautyIQ Architecture & Project Structure Guide

Welcome to the BeautyIQ project structure! This document details the architectural layout, directory organization, and patterns across the **UI Components**, **Context State**, **Backend Services & Security**, **Database**, and **Next.js App Router** layers.

---

## 🏗️ High-Level Directory Overview

```
beautyiq/
├── public/                   # 🖼️ Static assets (images, icons, robots.txt)
├── data/                     # 💾 SQLite database storage (beautyiq.db)
├── src/
│   ├── app/                  # 🌐 Next.js App Router (Pages, Layouts & HTTP Route Handlers)
│   │   ├── (auth)/           # Authentication pages (login, register, forgot-password)
│   │   ├── (customer)/       # Customer dashboard & settings pages
│   │   ├── (public)/         # Public marketplace pages (browse, search, compare)
│   │   ├── admin/            # Admin management portal pages
│   │   ├── api/              # HTTP REST API route handlers (/api/admin, /api/wishlist, etc.)
│   │   ├── globals.css       # Tailwind CSS & theme definitions
│   │   ├── layout.tsx        # Root HTML layout & global providers
│   │   └── page.tsx          # Homepage
│   │
│   ├── components/           # 🎨 Reusable UI & Domain React components
│   │   ├── admin/            # Admin portal components (tables, stat cards, modals)
│   │   ├── ai-requirement/   # AI skincare questionnaire & requirement forms
│   │   ├── auth/             # Login/Register modals and route guards
│   │   ├── home/             # Homepage feature sections (hero, discovery, comparisons)
│   │   ├── layout/           # Structural layout (navbar, footer, sidebar, container)
│   │   ├── product/          # Product cards, listings, search inputs
│   │   ├── recommendations/  # AI recommendation widgets & breakdown modals
│   │   ├── theme/            # Theme switcher toggle
│   │   └── ui/               # Design system primitives (button, input, modal, badge, etc.)
│   │
│   ├── context/              # 🔄 React State Providers
│   │   ├── auth-context.tsx          # User session, login/logout, role permissions
│   │   ├── comparison-context.tsx    # Multi-product comparison tray
│   │   ├── skin-profile-context.tsx  # User skin profile & quiz data
│   │   ├── theme-context.tsx         # Dark/Light mode theme state
│   │   └── toast-context.tsx         # Global toast notification alerts
│   │
│   ├── database/             # 🗄️ SQLite Database Layer (better-sqlite3)
│   │   ├── connection.ts     # Better-SQLite3 singleton with WAL mode & busy timeout
│   │   ├── schema.ts         # SQL DDL table migrations (users, profiles, sessions, etc.)
│   │   ├── repositories.ts   # DbService query methods & transactions
│   │   ├── crypto.ts         # Secure scrypt password hashing & verification
│   │   ├── seeds.ts          # Seed catalog data (brands, products, ingredients)
│   │   └── index.ts          # Unified database barrel export
│   │
│   ├── services/             # ⚙️ Business Logic Services & Data Pipeline
│   │   ├── data-pipeline/    # 7-stage automated data ingestion and quality calculator
│   │   ├── admin-data.service.ts
│   │   ├── ai-requirement.service.ts
│   │   ├── api-client.ts
│   │   ├── auth.service.ts
│   │   ├── comparison.service.ts
│   │   ├── data-export.service.ts
│   │   ├── ingredient.service.ts
│   │   ├── notification.service.ts
│   │   ├── product-search.service.ts
│   │   ├── product.service.ts
│   │   ├── recently-viewed.service.ts
│   │   ├── recommendation-engine.service.ts
│   │   ├── recommendation-history.service.ts
│   │   ├── search-history.service.ts
│   │   ├── value-engine.service.ts
│   │   └── wishlist.service.ts
│   │
│   ├── lib/                  # 🛡️ Utilities & Security
│   │   ├── security/         # Security guards, AI guardrails, rate limiting, validators
│   │   ├── utils.ts          # Tailwind cn() class merge helper
│   │   ├── db.ts             # Facade re-exporting from @/database
│   │   └── mock-data.ts      # Facade re-exporting from @/database/seeds
│   │
│   ├── types/                # 📐 Domain TypeScript definitions and data interfaces
│   │   └── index.ts
│   │
│   └── middleware.ts         # 🛡️ Next.js edge route guard middleware
│
├── package.json              # Project dependencies and npm scripts
├── next.config.js            # Next.js build and image optimization settings
├── tailwind.config.ts        # Design tokens and theme styling
└── tsconfig.json             # TypeScript compiler settings & path aliases
```

---

## 🎨 1. Components Layer (`src/components/`)

All UI components and presentation logic are cleanly categorized:
- **`src/components/ui/`**: Atomic design system primitives:
  - `button.tsx`, `input.tsx`, `modal.tsx`, `badge.tsx`, `toast.tsx`, `table.tsx`, `tabs.tsx`, etc.
- **`src/components/layout/`**: Structural layout components:
  - `navbar.tsx`, `footer.tsx`, `container.tsx`, `customer-sidebar.tsx`, `admin-sidebar.tsx`, `mobile-nav.tsx`, etc.
- **`src/components/home/`**: Homepage-specific sections:
  - `hero.tsx`, `featured-products.tsx`, `ai-search.tsx`, `price-comparison.tsx`, `trust-strip.tsx`, etc.
- **`src/components/product/`**: Product browsing & comparison cards:
  - `product-card.tsx`, `grouped-search-input.tsx`
- **`src/components/admin/`**: Admin portal components:
  - `admin-table.tsx`, `admin-stat-card.tsx`, `admin-confirm-modal.tsx`
- **`src/components/auth/`**: Authentication UI:
  - `auth-modal.tsx`, `protected-route.tsx`

---

## 🔄 2. State & Context Layer (`src/context/`)

React Context providers manage client-side state:
- `auth-context.tsx`: User login session, role checking, permissions.
- `theme-context.tsx`: Light/Dark mode state and toggle.
- `toast-context.tsx`: Global notification toast alerts.
- `skin-profile-context.tsx`: User personalized skin profile & quiz data.
- `comparison-context.tsx`: Multi-product ingredient comparison tray.

---

## ⚙️ 3. Backend Services Layer (`src/services/` & `src/lib/security/`)

Contains business rules, server-side data processors, algorithms, and security guards:
- **`src/services/`**: Core domain logic:
  - `auth.service.ts`: Session tokens, cookie parsing, login, and registration.
  - `product.service.ts`: Product retrieval, filtering, and catalog management.
  - `recommendation-engine.service.ts`: AI & heuristic ingredient compatibility matching.
  - `comparison.service.ts`: Side-by-side product price & ingredient comparison.
  - `admin-data.service.ts`: Platform administration metrics, seller data, listings.
  - `data-pipeline/`: 7-stage automated data ingestion and quality calculator pipeline.
- **`src/lib/security/`**: Policy enforcement & protection:
  - `auth-guard.ts`: Role-based route protection (`admin`, `customer`).
  - `ai-guardrail.service.ts`: Prompt injection and hallucination safety filters.
  - `medical-safety.ts`: Disclaimers and dermatological restriction checks.
  - `rate-limiter.ts`: Sliding-window request throttling.
  - `input-validator.ts`: XSS, SQLi, and payload sanitization.

---

## 🗄️ 4. Database Layer (`src/database/`)

Encapsulates data persistence, schema migrations, and database access:
- **`connection.ts`**: Better-SQLite3 singleton connection.
  - `WAL` (Write-Ahead Logging) mode for high concurrency.
  - `busy_timeout = 5000` to prevent `SQLITE_BUSY` file locks under load.
  - Foreign key constraint enforcement (`foreign_keys = ON`).
- **`schema.ts`**: Auto-migrated table DDL schemas:
  - `users`, `user_profiles`, `sessions`, `wishlists`, `saved_products`, `recommendation_history`.
- **`repositories.ts`**: `DbService` data access layer exposing typed methods for all tables.
- **`crypto.ts`**: Scrypt-based password hashing with cryptographic salt and timing-safe equality checks.
- **`seeds.ts`**: Default catalog dataset (mock products, brands, platforms, ingredients).

---

## 🌐 5. Routing & API Layer (`src/app/`)

Next.js App Router connects incoming HTTP requests to components and services:
- **`src/app/api/`**: Server-side REST API route handlers (`GET`, `POST`, `PUT`, `DELETE`).
- **`src/app/(public)/`**: Public UI pages (landing, browse, product details, ingredients, compare).
- **`src/app/(customer)/`**: Customer UI pages (account dashboard, profile, history, wishlist).
- **`src/app/(auth)/`**: Login, registration, and password recovery pages.
- **`src/app/admin/`**: Admin portal pages (dashboard, products, brands, platforms, logs).

---

## 🛠️ TypeScript Path Aliases

Configured in `tsconfig.json`:

| Alias | Target Directory | Description |
|---|---|---|
| `@/*` | `src/*` | Universal source root shortcut |
| `@/database` | `src/database/index.ts` | Database singleton, schema, repositories |
| `@/database/*` | `src/database/*` | Direct database modules |

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Start the production server
npm run start
```
