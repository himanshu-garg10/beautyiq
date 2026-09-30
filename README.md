# BeautyIQ

AI-powered personalized skincare product discovery, recommendation, comparison and product intelligence platform.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### Commands to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
# 1. Build optimized production bundle
npm run build

# 2. Run production server
npm run start
```

---

## 🏛️ Project Architecture Overview

The project is structured into clean, decoupled layers where the purpose of every file is immediately evident:

```
beautyiq/
├── public/                     # 10. Static Assets
│   ├── images/                 # Static illustrations & photography
│   ├── icons/                  # SVG icons & badges
│   ├── products/               # Product thumbnails & packshots
│   └── brands/                 # Brand logos
│
├── data/                       # Local SQLite storage (beautyiq.db)
│
├── src/
│   ├── app/                    # 1. Pages & Routes (Next.js App Router)
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout with context providers
│   │   ├── (auth)/             # Auth routes (/login, /register, /forgot-password)
│   │   ├── (customer)/         # Customer routes (/profile, /wishlist, /dashboard)
│   │   ├── (public)/           # Public routes (/products, /compare, /recommendations, /ingredients)
│   │   ├── admin/              # Admin routes (/admin/dashboard, /admin/products, etc.)
│   │   └── api/                # 2. Backend / REST API Route Handlers
│   │       ├── products/       # /api/products/[id]/prices, /api/products/[id]/value
│   │       ├── comparison/     # /api/comparison, /api/comparison/history
│   │       ├── wishlist/       # /api/wishlist, /api/wishlist/[productId]
│   │       ├── notifications/  # /api/notifications
│   │       ├── user/           # /api/user/settings, /api/user/export
│   │       └── admin/          # /api/admin/* (metrics, quality, listings, pipeline)
│   │
│   ├── components/             # 4. Reusable UI Components
│   │   ├── navigation/         # Navbar, MobileNav, NotificationDropdown
│   │   ├── hero/               # HeroSection banner & value highlights
│   │   ├── product/            # ProductCard, ProductDiscovery, TrendingProducts, CategoryGrid
│   │   ├── recommendations/    # AiRecommendationShowcase, PersonalizedDiscovery, ScoreBreakdown
│   │   ├── comparison/         # ComparisonShowcase, PriceComparison
│   │   ├── ingredients/        # IngredientIntelligence, IngredientsSection
│   │   ├── layout/             # Container, Section, Footer, CustomerSidebar, AdminSidebar
│   │   ├── home/               # Homepage sections (TrustStrip, WhyBeautyIq, ReviewsSection, FinalCta)
│   │   ├── auth/               # AuthModal, ProtectedRoute
│   │   ├── admin/              # AdminTable, AdminStatCard, AdminConfirmModal
│   │   ├── ai-requirement/     # ManualRequirementForm, EditableRequirementCard
│   │   ├── theme/              # ThemeToggle
│   │   └── ui/                 # Design system primitives (Button, Input, Modal, Badge, Toast, etc.)
│   │
│   ├── server/                 # 2 & 6. Backend Logic, Services & Repositories
│   │   ├── database/           # 3. Database Connection & Schema (better-sqlite3)
│   │   │   ├── connection.ts   # SQLite connection singleton with WAL mode
│   │   │   ├── schema.ts       # Table DDL & auto-migrations
│   │   │   └── crypto.ts       # Secure scrypt password hashing
│   │   ├── repositories/       # 3. Database Access Repositories
│   │   │   ├── userRepository.ts
│   │   │   ├── wishlistRepository.ts
│   │   │   ├── recommendationRepository.ts
│   │   │   └── index.ts        # DbService unified data access facade
│   │   ├── services/           # 6. Business Logic Services
│   │   │   ├── auth.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── recommendation-engine.service.ts
│   │   │   ├── comparison.service.ts
│   │   │   ├── ingredient.service.ts
│   │   │   ├── wishlist.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── product-search.service.ts
│   │   │   ├── ai-requirement.service.ts
│   │   │   ├── admin-data.service.ts
│   │   │   └── data-pipeline/  # 7-stage automated data ingestion
│   │   └── security/           # Route guards, rate limiters, medical safety, AI guardrails
│   │
│   ├── data/                   # Initial Datasets & Catalog
│   │   ├── categories.ts       # Routine categories
│   │   ├── brands.ts           # Partner brands
│   │   ├── ingredients.ts      # Scientific ingredient database
│   │   ├── products.ts         # Product catalog & listings
│   │   ├── users.ts            # Mock accounts, profiles, notifications
│   │   ├── platforms.ts        # E-commerce platforms & sellers
│   │   ├── admin.ts            # Audit logs, quality issues, reports
│   │   └── index.ts            # Unified dataset export
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Authentication session state
│   │   ├── useComparison.ts    # Comparison tray hook
│   │   ├── useWishlist.ts      # Wishlist toggle & state hook
│   │   ├── useSkinProfile.ts   # Skin profile quiz hook
│   │   ├── useTheme.ts         # Dark/Light mode theme hook
│   │   ├── useToast.ts         # Global notification alert hook
│   │   └── index.ts
│   │
│   ├── lib/                    # 7. Utilities & Helpers
│   │   ├── utils/              # Classname merge cn() helper
│   │   ├── api/                # API client response wrapper
│   │   ├── validation/         # Input, file, and URL validators
│   │   └── constants/          # Application constants & pagination defaults
│   │
│   ├── types/                  # 8. TypeScript Domain Interfaces
│   │   ├── user.ts             # User, SkinProfile, roles, notifications
│   │   ├── product.ts          # Product, ProductListing, Category, Brand
│   │   ├── ingredient.ts       # Ingredient, safety ratings, categories
│   │   ├── recommendation.ts   # AI requirements, scored products, match results
│   │   ├── comparison.ts       # ComparisonItem, PriceHistory, value metrics
│   │   ├── admin.ts            # Admin metrics, support requests, quality issues
│   │   ├── pipeline.ts         # Data sources, raw records, validation
│   │   └── index.ts            # Barrel export
│   │
│   └── config/                 # 9. Application Configuration
│       ├── site.ts             # Site metadata, routes, navigation menus
│       └── index.ts
│
├── .env.example                # Safe environment variables template
├── .env.local                  # Local development secrets (ignored by git)
├── next.config.js              # Next.js bundler & image security rules
├── tailwind.config.ts          # Tailwind design tokens & themes
└── tsconfig.json               # TypeScript compiler config & path aliases
```

---

## 🧭 File Categorization Guide

| Category | Location | Description |
|---|---|---|
| **1. Frontend / UI** | `src/components/`, `src/app/` | React views, layout structures, visual widgets, and styles. |
| **2. Backend / API** | `src/app/api/`, `src/server/` | Next.js REST route handlers and server runtime logic. |
| **3. Database Access** | `src/server/database/`, `src/server/repositories/` | SQLite database connection, table schemas, and typed data queries. |
| **4. Reusable Components** | `src/components/` | Domain-grouped UI elements (`hero`, `navigation`, `product`, `ui`, etc.). |
| **5. Pages / Routes** | `src/app/` | Individual route folders (`products/`, `compare/`, `recommendations/`, etc.). |
| **6. Business Logic** | `src/server/services/` | Scored recommendation engine, price comparison algorithms, pipelines. |
| **7. Utilities / Helpers** | `src/lib/` | `cn()` Tailwind utility, API client helpers, input sanitization. |
| **8. Types / Interfaces** | `src/types/` | Modular domain TypeScript definitions. |
| **9. Configuration** | `src/config/`, root configs | Navigation menus, site metadata, Tailwind & Next configs. |
| **10. Static Assets** | `public/` | Images, icons, logos, and public static files. |

---

## 🔒 Environment Variables

- `.env.local`: Used exclusively for local developer secrets (NEVER committed to git).
- `.env.example`: Safe template containing required environment variable keys with empty or placeholder values.

---

## 🛡️ Verification & Health

- **Type Check**: `npx tsc --noEmit` passes with 0 errors.
- **Production Build**: `npm run build` compiles 65 static & dynamic routes.
- **Live Dev Server**: Running on [http://localhost:3000](http://localhost:3000).
