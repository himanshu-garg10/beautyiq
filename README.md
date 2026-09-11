# BeautyIQ

AI-powered personalized skincare product discovery, recommendation, comparison
and product intelligence platform.

This is the **foundation + homepage** phase only. No backend, database,
authentication, or AI integration is included yet — all data is mock data
living in `src/lib/mock-data.ts`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm run start
```

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with a custom design token system (see `tailwind.config.ts`)
- Hand-authored shadcn/ui-style primitives (`class-variance-authority` +
  `tailwind-merge`)
- Framer Motion for animation
- Lucide React for icons

## Project structure

```
src/
  app/
    layout.tsx        Root layout, fonts, metadata
    page.tsx           Homepage — composes all sections
    globals.css         Design tokens, base styles, focus states
  components/
    layout/            Navbar, mobile nav, footer, container, section
    ui/                 Button, badge, card, search input, modal, skeleton,
                        section heading — reusable across the whole app
    home/               Homepage-only sections (hero, how-it-works, etc.)
    product/            ProductCard — reusable anywhere products are listed
  lib/
    utils.ts            `cn()` class merge helper
    mock-data.ts        All mock products, categories, ingredients, prices
  types/
    index.ts            Shared TypeScript interfaces
```

## Notes

- All images are loaded from Unsplash as placeholders (configured in
  `next.config.js`).
- The AI search bar is a visual prototype only — it does not call any
  backend or AI service yet.
- Colors, spacing and type scale are defined once in `tailwind.config.ts`
  and `globals.css` so future pages stay consistent.
