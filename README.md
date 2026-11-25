# BeautyIQ

> A skincare discovery platform that helps people explore products, understand common cosmetic ingredients, compare available retailer listings, and get AI-assisted product directions.

[Live demo](https://beautyiq-s3hf.onrender.com) · [Report an issue](https://github.com/himanshu-garg10/beautyiq/issues) · [Explore the source](https://github.com/himanshu-garg10/beautyiq)

---

## Why BeautyIQ?

Finding skincare online can feel noisy: the same product is described differently on every store, ingredient labels are hard to read, and it is difficult to know where to begin. BeautyIQ brings those early research steps together in one place.

It is designed as a product-discovery and comparison experience—not a diagnostic or medical service. The floating **BeautyIQ AI** chatbot and **Skin Scan** feature give cosmetic-care guidance and use the project catalog to surface relevant products; they do not replace advice from a dermatologist.

## What the platform includes

- **BeautyIQ AI floating chatbot** — a conversational skincare assistant available from the bottom-right bubble on every public page. Ask in English, Hindi, or Hinglish about your skin type, concerns, or routine, get real catalog product cards, or jump to Skin Scan.
- **Face Skin Scan** — upload or capture a photo in-memory (never stored) for cosmetic skin observations, concern breakdown, routine tips, and matching catalog products.
- **Product discovery** — browse the catalog by category, concern, skin type, brand, ingredient, or price range.
- **Concern guides** — practical starting points for concerns such as dullness, acne, dryness, oiliness, texture, pigmentation, dark circles, and more.
- **Ingredient intelligence** — explore ingredient names and the cosmetic concerns they are commonly associated with.
- **Comparison workspace** — add only the products you choose, then inspect product information and available retailer listings side by side.
- **Personal accounts** — each account keeps its own wishlist, comparison selections, profile, activity, and notifications.
- **Admin control room** — protected tools for catalog import, data quality checks, products, brands, listings, customer records, and support requests.
- **Responsive interface** — works across desktop and mobile, with light and dark themes.

## Product principles

| Principle | What it means in BeautyIQ |
| --- | --- |
| Transparent catalog | Product and retailer information is shown only when it exists in the stored catalog. |
| Separate user data | Wishlists, comparisons, history, and notifications belong to the signed-in account only. |
| Cosmetic guidance | AI suggestions are phrased as product-discovery guidance, not medical diagnosis or treatment. |
| Useful comparison | Retailer buttons open the recorded listing directly when a product URL is available. |

## Technology

- **Framework:** Next.js 14 (App Router) and React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion, Lucide icons
- **Database:** MongoDB Atlas through Prisma
- **Authentication:** NextAuth with credential-based accounts
- **AI:** Google Gemini for natural-language requirement extraction and question-specific cosmetic guidance
- **Email:** Resend (optional; used for email flows when configured)
- **Deployment:** Render

## Getting started

### Prerequisites

- Node.js 18.17+ (Node.js 20 LTS is recommended)
- npm 9+
- A MongoDB Atlas database for persistent local data
- A Gemini API key if you want AI Match to use Gemini

### 1. Clone and install

```bash
git clone https://github.com/himanshu-garg10/beautyiq.git
cd beautyiq
npm install
```

### 2. Add environment variables

Copy the template and fill in your own values:

```bash
cp .env.example .env.local
```

At minimum, configure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `ADMIN_EMAILS`. Add `GEMINI_API_KEY` to enable Gemini-powered AI Match guidance.

### 3. Prepare the database

```bash
npm run db:push
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production check

```bash
npm run build
npm run start
```

## Environment variables

Never commit a real `.env.local` file or share secrets in screenshots, issues, or commits.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MongoDB Atlas connection string used by Prisma. |
| `NEXTAUTH_SECRET` | Yes | Encrypts/signs authentication session data. |
| `NEXTAUTH_URL` | Yes in production | Public application URL, such as the Render service URL. |
| `ADMIN_EMAILS` | Yes for admin tools | Comma-separated list of email addresses allowed to access admin routes. |
| `GEMINI_API_KEY` | Recommended | Enables Gemini parsing and tailored AI Match guidance. |
| `GEMINI_MODEL` | Optional | Gemini model name; defaults to the app configuration. |
| `RESEND_API_KEY` | Optional | Enables configured email flows. |
| `EMAIL_FROM` | Optional | Sender address used with Resend. A verified domain is needed to mail external recipients. |
| `SUPPORT_FROM_EMAIL` / `SUPPORT_TO_EMAIL` | Optional | Contact and support email configuration. |
| `RATE_LIMIT_*` | Optional | Controls API request throttling. |

For a full key template, see [`.env.example`](.env.example).

## Useful commands

```bash
npm run dev              # start local development
npm run build            # create a production build
npm run start            # run the production build
npm run db:push          # sync Prisma schema with MongoDB
npm run db:seed          # seed initial project data
npm run catalog:import   # run the catalog import script
npm test                 # run the skincare chat test suite
```

## Project structure

```text
src/
├── app/                  # Pages, layouts, API routes, admin area
├── components/           # Reusable UI grouped by feature
├── context/              # Auth, skin profile, theme, toast, comparison state
├── services/             # Client-facing product, search, AI and comparison services
├── server/               # Server business logic, repositories and security utilities
├── lib/                  # Prisma, auth, validation, email and shared helpers
├── data/                 # Seed/catalog data and content definitions
└── types/                # Shared TypeScript domain types

prisma/                   # MongoDB Prisma schema and seed script
public/images/            # Concern and category imagery
scripts/                  # Import utilities
```

## Main routes

| Area | Route |
| --- | --- |
| Home | `/` |
| Products | `/products` |
| Categories | `/categories` |
| Concerns | `/ingredients` |
| AI Match | `/ai-search` |
| Compare | `/compare` |
| Account | `/account` |
| Admin dashboard | `/admin/dashboard` |

## Current scope and honest limitations

- Product availability, prices, images, and retailer links depend on the data currently imported into the BeautyIQ catalog.
- Retailer APIs may require partner approval; the project does not invent listings or prices when a verified source is not available.
- AI Match is intended for cosmetic product exploration. Persistent, severe, painful, infected, or otherwise concerning skin symptoms should be discussed with a qualified dermatologist.
- The free Render service can take time to wake after inactivity.

## Contributing

This is an academic major-project repository. Suggestions and improvements are welcome:

1. Create a branch from `main`.
2. Keep changes focused and do not add API keys or personal credentials.
3. Run `npm run build` before opening a pull request.
4. Explain the user-facing impact of your change.

---

Built for clearer skincare discovery, not louder product claims.
