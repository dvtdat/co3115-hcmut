# TechMart — Electronics E-Commerce Frontend

Single-vendor storefront for electronics products. All data is mocked in-memory — no backend required.

**Fixed credentials:**
- `admin@test.com` / `admin123` — admin role
- `user@test.com` / `user123` — user role

## Tech Stack

React 19 · TypeScript · Vite · TanStack Router · TanStack Query · TanStack Table · Zustand · shadcn/ui · Tailwind CSS v4 · react-hook-form + Zod · i18next (EN, DE) · Recharts

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

## Pages

| Area      | Pages                                                              |
| --------- | ------------------------------------------------------------------ |
| Public    | Home, Products, Product Detail, About                              |
| Account   | Login, Cart, Orders, Order Detail, Profile                         |
| Checkout  | Delivery, Review, Payment, Success, Order Confirmation             |
| Admin     | Dashboard, Products, Categories, Orders, Order Detail, Customers, Vouchers |

## Commands

```bash
npm run dev              # start dev server
npm run build            # production build (tsc + vite)
npm run preview          # preview production build locally
npm run lint             # ESLint
npm run format           # Prettier

# i18n
npm run i18n:extract     # extract new keys
npm run i18n:sync        # sync all locales
npm run i18n:types       # generate i18n type definitions
npm run i18n:status      # translation coverage report
```
